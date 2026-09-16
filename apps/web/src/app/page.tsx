"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import LiveRadarMap from "@/components/LiveRadarMap";
import VehicleList from "@/components/VehicleList";
import TelemetryFeed from "@/components/TelemetryFeed";
import AlertBanner from "@/components/AlertBanner";
import ManualAlertModal from "@/components/ManualAlertModal";
import RouteReplayPlayer from "@/components/RouteReplayPlayer";
import C4IsrLoginGate from "@/components/C4IsrLoginGate";
import { createSignalRConnection } from "@/lib/signalr";
import { playTacticalSiren } from "@/lib/audioAlert";
import { Vehicle, TelemetryDto, TrackedVehicleState } from "@/types/telemetry";
import { AlertDto } from "@/types/alert";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function Home() {
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
      const res = await fetch(`${API_BASE_URL}/vehicles`);
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

      const res = await fetch(`${API_BASE_URL}/alerts/active`, { headers });
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
      await fetch(`${API_BASE_URL}/alerts/${id}/acknowledge`, { method: "POST", headers });
    } catch (err) {
      console.warn("Alarm onaylanamadı:", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchActiveAlerts();
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
          fetchVehicles();
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black animate-in fade-in duration-300">
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

      {/* Ana Operasyon Ekranı (Mobil, Tablet & Masaüstü Uyumlu Grid) */}
      <main className="flex-1 p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Canlı Taktik Alarm Paneli & AI Anomali İkaz Kartı */}
        <AlertBanner
          alerts={alerts}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          latestAiAnomalyMessage={latestAiAnomalyMessage}
        />

        {/* Seçili Araç Uçuş Rota Geçmişi Oynatıcısı */}
        {selectedVehicleState && (
          <RouteReplayPlayer
            selectedVehicleState={selectedVehicleState}
            onClose={() => {
              setSelectedVehicleId(null);
              setPlaybackTelemetry(null);
            }}
            onPlaybackPointChange={(point) => setPlaybackTelemetry(point)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Sol Kolon (2 Birim - Masaüstü): Radar Haritası & Telemetri Akışı */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
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

          {/* Sağ Kolon (1 Birim - Masaüstü / Mobil Altında): Aktif Araç Filosu */}
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
      </main>

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
