"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import LiveRadarMap from "@/components/LiveRadarMap";
import VehicleList from "@/components/VehicleList";
import TelemetryFeed from "@/components/TelemetryFeed";
import { createSignalRConnection } from "@/lib/signalr";
import { Vehicle, TelemetryDto, TrackedVehicleState } from "@/types/telemetry";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function Home() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [trackedVehicles, setTrackedVehicles] = useState<Map<string, TrackedVehicleState>>(new Map());
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<{ telemetry: TelemetryDto; vehicleName: string }[]>([]);

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

  useEffect(() => {
    fetchVehicles();
  }, []);

  // 2. SignalR Canlı Yayın Bağlantısını Kur ve Dinle
  useEffect(() => {
    const connection = createSignalRConnection();

    connection
      .start()
      .then(() => {
        console.log("SignalR Hub Bağlantısı Başarılı!");
        setIsConnected(true);
      })
      .catch((err) => {
        console.warn("SignalR bağlantı hatası (Backend kapalı olabilir):", err);
        setIsConnected(false);
      });

    // Canlı Telemetri Paketi Düştüğünde
    connection.on("ReceiveTelemetry", (telemetry: TelemetryDto) => {
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
          // Eğer araç henüz map'e eklenmediyse REST API'den araçları yenile
          fetchVehicles();
        }

        // Akış günlüğüne (Feed) ekle
        setTelemetryLogs((prevLogs) => [
          { telemetry, vehicleName },
          ...prevLogs.slice(0, 99),
        ]);

        return newMap;
      });
    });

    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    return () => {
      connection.stop();
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

      {/* Ana Operasyon Ekranı */}
      <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon (2 Birim): Radar Haritası & Telemetri Akışı */}
          <div className="lg:col-span-2 space-y-6">
            <LiveRadarMap
              trackedVehicles={trackedVehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={setSelectedVehicleId}
            />

            <TelemetryFeed telemetryLogs={telemetryLogs} />
          </div>

          {/* Sağ Kolon (1 Birim): Aktif Araç Filosu */}
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
