"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import LiveRadarMap from "@/components/LiveRadarMap";
import VehicleList from "@/components/VehicleList";
import TelemetryFeed from "@/components/TelemetryFeed";
import AlertBanner from "@/components/AlertBanner";
import ManualAlertModal from "@/components/ManualAlertModal";
import RouteReplayPlayer from "@/components/RouteReplayPlayer";
import C4IsrLoginGate from "@/components/C4IsrLoginGate";
import { createSignalRConnection } from "@/lib/signalr";
import { playTacticalSiren } from "@/lib/audioAlert";
import { getApiBaseUrl } from "@/lib/config";
import { Vehicle, TelemetryDto, TrackedVehicleState, VehicleType, VehicleStatus } from "@/types/telemetry";
import { AlertDto } from "@/types/alert";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [trackedVehicles, setTrackedVehicles] = useState<Map<string, TrackedVehicleState>>(new Map());
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<{ telemetry: TelemetryDto; vehicleName: string }[]>([]);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  
  // JWT Authentication & Guest State
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [operatorUser, setOperatorUser] = useState<string | null>(null);
  const [isGuestView, setIsGuestView] = useState<boolean>(false);

  // Ref to track guest view status safely inside SignalR callbacks without re-triggering useEffect
  const isGuestViewRef = useRef<boolean>(false);
  useEffect(() => {
    isGuestViewRef.current = isGuestView;
  }, [isGuestView]);

  // Modal, Replay & AI Anomaly Banner State
  const [isManualAlertModalOpen, setIsManualAlertModalOpen] = useState<boolean>(false);
  const [playbackTelemetry, setPlaybackTelemetry] = useState<TelemetryDto | null>(null);
  const [latestAiAnomalyMessage, setLatestAiAnomalyMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("aegis_jwt_token");
    const savedUser = localStorage.getItem("aegis_operator_user");
    if (savedToken) {
      setJwtToken(savedToken);
      setOperatorUser(savedUser);
    }
  }, []);

  const handleLoginSuccess = (token: string, username: string) => {
    setJwtToken(token);
    setOperatorUser(username);
    setIsGuestView(false);
    fetchVehicles();
    fetchActiveAlerts(token);
    playTacticalSiren("ack");
  };

  const handleLogout = () => {
    localStorage.removeItem("aegis_jwt_token");
    localStorage.removeItem("aegis_operator_user");
    setJwtToken(null);
    setOperatorUser(null);
    setIsGuestView(false);
  };

  // 1. Mevcut Araçları REST API'den Çek
  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/vehicles`);
      if (res.ok) {
        const vehicles: Vehicle[] = await res.json();
        setTrackedVehicles((prevMap) => {
          const newMap = new Map(prevMap);
          vehicles.forEach((v) => {
            if (!newMap.has(v.id)) {
              newMap.set(v.id, { vehicle: v, telemetryHistory: [] });
            } else {
              const existing = newMap.get(v.id)!;
              newMap.set(v.id, { ...existing, vehicle: v });
            }
          });
          return newMap;
        });
      }
    } catch (err) {
      console.warn("API araç listesi yüklenemedi:", err);
    }
  };

  // Aktif Alarmları Çek (JWT Token ile Yetkili İstek)
  const fetchActiveAlerts = async (tokenOverride?: string) => {
    try {
      const token = tokenOverride || jwtToken;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${getApiBaseUrl()}/alerts/active`, { headers });
      if (res.ok) {
        const data: AlertDto[] = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.warn("Alarmlar yüklenemedi:", err);
    }
  };

  const handleAcknowledgeAlert = async (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isAcknowledged: true } : a)));
    if (jwtToken || isGuestView) playTacticalSiren("ack");
    try {
      const headers: Record<string, string> = {};
      if (jwtToken) {
        headers["Authorization"] = `Bearer ${jwtToken}`;
      }
      await fetch(`${getApiBaseUrl()}/alerts/${id}/acknowledge`, { method: "POST", headers });
    } catch (err) {
      console.warn("Alarm onaylanamadı:", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchActiveAlerts();

    const interval = setInterval(() => {
      fetchVehicles();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // 2. SignalR Canlı Yayın Bağlantısını Kur ve Dinle (Bağımlılık Dizisi Boyutu Sabit Kalır: [])
  useEffect(() => {
    let isMounted = true;
    const connection = createSignalRConnection();

    connection
      .start()
      .then(() => {
        if (isMounted) {
          console.log("SignalR Hub Bağlantısı Başarılı!");
          setIsConnected(true);
        } else {
          connection.stop();
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("SignalR bağlantı bilgisi:", err.message || err);
          setIsConnected(false);
        }
      });

    // Connection Ack Handler
    connection.on("ReceiveConnectionAck", (msg: string) => {
      if (!isMounted) return;
      console.log("SignalR Connection ACK:", msg);
    });

    // Canlı Telemetri Paketi Düştüğünde
    connection.on("ReceiveTelemetry", (telemetry: TelemetryDto) => {
      if (!isMounted) return;

      if (telemetry.anomalies && telemetry.anomalies.length > 0) {
        const firstAnomaly = telemetry.anomalies[0];
        setLatestAiAnomalyMessage(firstAnomaly.description);
        // Sadece Oturum Açıkken veya Misafir Ekranında Ses Çal
        if (localStorage.getItem("aegis_jwt_token") || isGuestViewRef.current) {
          playTacticalSiren("warning");
        }
      }

      setTrackedVehicles((prevMap) => {
        const newMap = new Map(prevMap);
        const state = newMap.get(telemetry.vehicleId);

        let vehicleName = "Bilinmeyen Araç";

        if (state) {
          vehicleName = state.vehicle.name;
          const updatedHistory = [telemetry, ...state.telemetryHistory].slice(0, 50);
          newMap.set(telemetry.vehicleId, {
            ...state,
            latestTelemetry: telemetry,
            telemetryHistory: updatedHistory,
          });
        } else {
          const fallbackVehicle: Vehicle = {
            id: telemetry.vehicleId,
            name: `TAKTIK-UNITE-${telemetry.vehicleId.slice(0, 6).toUpperCase()}`,
            type: VehicleType.Drone,
            status: VehicleStatus.Active,
            lastSeenAt: telemetry.timestamp,
          };
          vehicleName = fallbackVehicle.name;
          newMap.set(telemetry.vehicleId, {
            vehicle: fallbackVehicle,
            latestTelemetry: telemetry,
            telemetryHistory: [telemetry],
          });
        }

        setTelemetryLogs((prevLogs) => [
          { telemetry, vehicleName },
          ...prevLogs.slice(0, 99),
        ]);

        return newMap;
      });
    });

    // Canlı Taktik Alarm Düştüğünde
    connection.on("ReceiveAlert", (alert: AlertDto) => {
      if (!isMounted) return;
      setAlerts((prev) => [alert, ...prev.filter((a) => a.id !== alert.id)]);
      // Sadece Oturum Açıkken veya Misafir Ekranında Siren Çal
      if (localStorage.getItem("aegis_jwt_token") || isGuestViewRef.current) {
        playTacticalSiren(alert.severity === 3 ? "critical" : "warning");
      }
    });

    connection.onreconnecting(() => isMounted && setIsConnected(false));
    connection.onreconnected(() => isMounted && setIsConnected(true));
    connection.onclose(() => isMounted && setIsConnected(false));

    return () => {
      isMounted = false;
      if (connection.state === "Connected") {
        connection.stop();
      }
    };
  }, []);

  const selectedVehicleState = selectedVehicleId ? trackedVehicles.get(selectedVehicleId) || null : null;

  // Sıfır-Güven (Zero-Trust): Oturum açılmamışsa ve misafir izleyici seçilmemişse Giriş Kapısını Göster
  if (!jwtToken && !isGuestView) {
    return (
      <C4IsrLoginGate
        onLoginSuccess={handleLoginSuccess}
        onGuestAccess={() => setIsGuestView(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050913] text-slate-100 flex font-mono selection:bg-cyan-500 selection:text-black animate-in fade-in duration-300">
      {/* Sol Dikey C4ISR Navigasyon Barı */}
      <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Üst Bar */}
        <Header
          isConnected={isConnected}
          activeVehiclesCount={trackedVehicles.size}
          totalTelemetryCount={telemetryLogs.length}
          jwtToken={jwtToken}
          operatorUser={isGuestView ? "Misafir" : operatorUser}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          onOpenManualAlertModal={() => setIsManualAlertModalOpen(true)}
        />

        {/* Ana Operasyon Ekranı (Tab Değişimli Dinamik C4ISR Görünümleri) */}
        <main className="flex-1 p-3 sm:p-5 space-y-4 sm:space-y-5 max-w-[1800px] w-full mx-auto overflow-y-auto">
          {/* Canlı Taktik Alarm Paneli & AI Anomali İkaz Kartı */}
          <AlertBanner
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            latestAiAnomalyMessage={latestAiAnomalyMessage}
          />

          {/* Seçili Araç Uçuş Rota Geçmişi Oynatıcısı (Sadece Harita ve Komuta Ekranında Görünür) */}
          {(activeTab === "dashboard" || activeTab === "map") && selectedVehicleState && (
            <RouteReplayPlayer
              selectedVehicleState={selectedVehicleState}
              onClose={() => {
                setSelectedVehicleId(null);
                setPlaybackTelemetry(null);
              }}
              onPlaybackPointChange={(point) => setPlaybackTelemetry(point)}
            />
          )}

          {/* TAB 1: Genel Komuta Merkezi Görünümü (Dashboard) */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="lg:col-span-2 space-y-4 sm:space-y-5">
                <LiveRadarMap
                  trackedVehicles={trackedVehicles}
                  selectedVehicleId={selectedVehicleId}
                  onSelectVehicle={(id) => {
                    setSelectedVehicleId(id);
                    setPlaybackTelemetry(null);
                  }}
                  playbackTelemetry={playbackTelemetry}
                />
                <TelemetryFeed telemetryLogs={telemetryLogs} />
              </div>

              <div className="lg:col-span-1">
                <VehicleList
                  trackedVehicles={trackedVehicles}
                  selectedVehicleId={selectedVehicleId}
                  onSelectVehicle={(id) => {
                    setSelectedVehicleId(id);
                    setPlaybackTelemetry(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Tam Ekran Harita Görünümü (Map) */}
          {activeTab === "map" && (
            <div className="w-full h-[calc(100vh-140px)] min-h-[720px]">
              <LiveRadarMap
                trackedVehicles={trackedVehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={(id) => {
                  setSelectedVehicleId(id);
                  setPlaybackTelemetry(null);
                }}
                playbackTelemetry={playbackTelemetry}
                className="w-full h-full"
              />
            </div>
          )}

          {/* TAB 3: Özel Filo Yönetim & Envanter Konsolu (Fleet) */}
          {activeTab === "fleet" && (
            <div className="w-full">
              <VehicleList
                trackedVehicles={trackedVehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={(id) => {
                  setSelectedVehicleId(id);
                  setPlaybackTelemetry(null);
                }}
                onPlayRoute={(id) => {
                  setSelectedVehicleId(id);
                  setPlaybackTelemetry(null);
                  setActiveTab("map");
                }}
                isFullView={true}
              />
            </div>
          )}

          {/* TAB 4: Yapay Zeka & Anomali Detay Görünümü (AI) */}
          {activeTab === "ai" && (
            <div className="space-y-5 font-mono">
              <div className="c4isr-glass-panel p-6 rounded-2xl border border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-950 p-2.5 rounded-xl border border-purple-500/50 text-purple-400 animate-pulse">
                      🤖
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-purple-300 tracking-wider">HAVERSINE KINEMATIC AI ANOMALY ENGINE</h3>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">
                        Gerçek zamanlı yeryüzü eğriliği kinetik modelleri (d = 2R · atan2(√a, √(1-a))) ile Elektronik Harp (Jammer/Spoofer) Tespiti.
                      </p>
                    </div>
                  </div>
                  <span className="bg-purple-950 text-purple-300 border border-purple-500/60 text-[10px] px-3 py-1 rounded-xl font-bold tracking-widest uppercase">
                    MIL-SPEC AI v3.0 ACTIVE
                  </span>
                </div>

                {/* Yapay Zeka Metrik Özet Kartları */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-purple-900/40">
                  <div className="bg-[#050811] p-3 rounded-xl border border-rose-500/30">
                    <span className="text-[10px] text-rose-400 block font-bold">GPS SPOOFING TESPİTİ</span>
                    <span className="text-lg font-black text-rose-300">
                      {telemetryLogs.filter(l => l.telemetry.anomalies && l.telemetry.anomalies.some(a => a.anomalyType === 1)).length} Adet
                    </span>
                  </div>
                  <div className="bg-[#050811] p-3 rounded-xl border border-amber-500/30">
                    <span className="text-[10px] text-amber-400 block font-bold">SERBEST DÜŞÜŞ İKAZI</span>
                    <span className="text-lg font-black text-amber-300">
                      {telemetryLogs.filter(l => l.telemetry.anomalies && l.telemetry.anomalies.some(a => a.anomalyType === 2)).length} Adet
                    </span>
                  </div>
                  <div className="bg-[#050811] p-3 rounded-xl border border-orange-500/30">
                    <span className="text-[10px] text-orange-400 block font-bold">TERMAL KAÇIŞ RİSKİ</span>
                    <span className="text-lg font-black text-orange-300">
                      {telemetryLogs.filter(l => l.telemetry.anomalies && l.telemetry.anomalies.some(a => a.anomalyType === 3)).length} Adet
                    </span>
                  </div>
                  <div className="bg-[#050811] p-3 rounded-xl border border-cyan-500/30">
                    <span className="text-[10px] text-cyan-400 block font-bold">TOPLAM İŞLENEN PAKET</span>
                    <span className="text-lg font-black text-cyan-300">
                      {telemetryLogs.length} Paket
                    </span>
                  </div>
                </div>
              </div>

              {/* Tespiti Yapılan Anomali Listesi Kartları */}
              {telemetryLogs.filter(l => l.telemetry.anomalies && l.telemetry.anomalies.length > 0).length > 0 && (
                <div className="c4isr-glass-panel p-5 rounded-2xl border border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)] space-y-3">
                  <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span>SON ALARM VEREN KİNETİK ANOMALİ RAPORLARI</span>
                  </h4>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2">
                    {telemetryLogs
                      .filter(l => l.telemetry.anomalies && l.telemetry.anomalies.length > 0)
                      .slice(0, 10)
                      .map((log, idx) => (
                        <div key={idx} className="bg-[#050812] border border-rose-600/40 p-3 rounded-xl flex items-center justify-between text-xs hover:border-rose-400 transition">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-rose-300 text-sm">🚨 {log.vehicleName}</span>
                              <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40">
                                {new Date(log.telemetry.timestamp).toLocaleTimeString("tr-TR")}
                              </span>
                            </div>
                            <p className="text-slate-300 text-xs mt-1 font-sans">
                              {log.telemetry.anomalies![0].description}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">AI GÜVEN SKORU</span>
                            <span className="text-emerald-400 font-bold text-xs">
                              %{(log.telemetry.anomalies![0].confidenceScore * 100).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <TelemetryFeed telemetryLogs={telemetryLogs} />
            </div>
          )}

          {/* TAB 5: Görev Raporları ve Audit Görünümü (Reports) */}
          {activeTab === "reports" && (
            <div className="space-y-5">
              <div className="c4isr-glass-panel p-6 rounded-2xl border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)] font-mono">
                <h3 className="text-lg font-black text-emerald-300 mb-2">📄 AFTER-ACTION REPORT (AAR) AUDIT KONSOLU</h3>
                <p className="text-xs text-slate-300">
                  Uçuş sonrasında tüm telemetri kayıtları, konum koordinatları, hız dalgalanmaları ve AI anomali işaretleri CSV formatında indirilebilir.
                </p>
              </div>
              <TelemetryFeed telemetryLogs={telemetryLogs} />
            </div>
          )}
        </main>
      </div>

      {/* Manuel Alarm Fırlatma Modalı */}
      <ManualAlertModal
        isOpen={isManualAlertModalOpen}
        onClose={() => setIsManualAlertModalOpen(false)}
        jwtToken={jwtToken}
        trackedVehicles={trackedVehicles}
        onAlertSent={() => fetchActiveAlerts()}
      />
    </div>
  );
}
