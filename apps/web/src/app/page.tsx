"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import LiveRadarMap from "@/components/LiveRadarMap";
import VehicleList from "@/components/VehicleList";
import TelemetryFeed from "@/components/TelemetryFeed";
import AlertBanner from "@/components/AlertBanner";
import { createSignalRConnection } from "@/lib/signalr";
import { Vehicle, TelemetryDto, TrackedVehicleState } from "@/types/telemetry";
import { AlertDto } from "@/types/alert";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function Home() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [trackedVehicles, setTrackedVehicles] = useState<Map<string, TrackedVehicleState>>(new Map());
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<{ telemetry: TelemetryDto; vehicleName: string }[]>([]);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);

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

  // Aktif Alarmları Çek
  const fetchActiveAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/active`);
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
    try {
      await fetch(`${API_BASE_URL}/alerts/${id}/acknowledge`, { method: "POST" });
    } catch (err) {
      console.warn("Alarm onaylanamadı:", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchActiveAlerts();
  }, []);

  // 2. SignalR Canlı Yayın Bağlantısını Kur ve Dinle
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

    // Canlı Telemetri Paketi Düştüğünde
    connection.on("ReceiveTelemetry", (telemetry: TelemetryDto) => {
      if (!isMounted) return;

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

    // Canlı Taktik Alarm Düğünde
    connection.on("ReceiveAlert", (alert: AlertDto) => {
      if (!isMounted) return;
      setAlerts((prev) => [alert, ...prev.filter((a) => a.id !== alert.id)]);
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

  const totalTelemetryCount = telemetryLogs.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Üst Bar */}
      <Header
        isConnected={isConnected}
        activeVehiclesCount={trackedVehicles.size}
        totalTelemetryCount={totalTelemetryCount}
      />

      {/* Ana Operasyon Ekranı (Mobil, Tablet & Masaüstü Uyumlu Grid) */}
      <main className="flex-1 p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Canlı Taktik Alarm Paneli */}
        <AlertBanner alerts={alerts} onAcknowledgeAlert={handleAcknowledgeAlert} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Sol Kolon (2 Birim - Masaüstü): Radar Haritası & Telemetri Akışı */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <LiveRadarMap
              trackedVehicles={trackedVehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={setSelectedVehicleId}
            />

            <TelemetryFeed telemetryLogs={telemetryLogs} />
          </div>

          {/* Sağ Kolon (1 Birim - Masaüstü / Mobil Altında): Aktif Araç Filosu */}
          <div className="lg:col-span-1">
            <VehicleList
              trackedVehicles={trackedVehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={setSelectedVehicleId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
