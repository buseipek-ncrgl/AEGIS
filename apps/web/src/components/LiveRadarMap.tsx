"use client";

import { useState } from "react";
import { TrackedVehicleState, VehicleType } from "@/types/telemetry";
import { Navigation, Plane, Ambulance, ShieldAlert, Cpu, Compass } from "lucide-react";

interface LiveRadarMapProps {
  trackedVehicles: Map<string, TrackedVehicleState>;
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
}

export default function LiveRadarMap({ trackedVehicles, selectedVehicleId, onSelectVehicle }: LiveRadarMapProps) {
  const [activeRegion, setActiveRegion] = useState<"ANKARA" | "IZMIR" | "ALL">("ANKARA");

  const vehicleList = Array.from(trackedVehicles.values());

  // Harita Haritalama Koordinat Ofsetleri (Ankara Merkez: 39.93, 32.85 | İzmir Merkez: 38.42, 27.14)
  const getPositionPercent = (lat: number, lng: number) => {
    let minLat = 39.85, maxLat = 40.0, minLng = 32.7, maxLng = 33.0;

    if (activeRegion === "IZMIR") {
      minLat = 38.3; maxLat = 38.55; minLng = 27.0; maxLng = 27.3;
    } else if (activeRegion === "ALL") {
      minLat = 38.0; maxLat = 40.2; minLng = 26.8; maxLng = 33.2;
    }

    const x = Math.max(5, Math.min(95, ((lng - minLng) / (maxLng - minLng)) * 100));
    const y = Math.max(5, Math.min(95, 100 - ((lat - minLat) / (maxLat - minLat)) * 100));

    return { left: `${x}%`, top: `${y}%` };
  };

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case VehicleType.Drone:
        return <Plane className="w-5 h-5 text-emerald-400 transform -rotate-45" />;
      case VehicleType.Ambulance:
        return <Ambulance className="w-5 h-5 text-rose-400 animate-pulse" />;
      case VehicleType.Helicopter:
        return <Navigation className="w-5 h-5 text-cyan-400" />;
      default:
        return <Cpu className="w-5 h-5 text-amber-400" />;
    }
  };

  const selectedVehicleState = selectedVehicleId ? trackedVehicles.get(selectedVehicleId) : null;

  return (
    <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-[550px] flex flex-col">
      {/* Radar Üst Kontrol Barı */}
      <div className="bg-slate-900/80 backdrop-blur px-4 py-2 border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: "8s" }} />
          <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">
            Taktik GIS Radar Ekrani ({activeRegion})
          </span>
        </div>

        {/* Bölge Seçim Butonları */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveRegion("ANKARA")}
            className={`px-3 py-1 text-[11px] font-bold rounded transition ${
              activeRegion === "ANKARA" ? "bg-emerald-600 text-white shadow" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Ankara (İHA & AFAD)
          </button>
          <button
            onClick={() => setActiveRegion("IZMIR")}
            className={`px-3 py-1 text-[11px] font-bold rounded transition ${
              activeRegion === "IZMIR" ? "bg-emerald-600 text-white shadow" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            İzmir (Helikopter)
          </button>
          <button
            onClick={() => setActiveRegion("ALL")}
            className={`px-3 py-1 text-[11px] font-bold rounded transition ${
              activeRegion === "ALL" ? "bg-emerald-600 text-white shadow" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Tüm Türkiye
          </button>
        </div>
      </div>

      {/* Radar Izgara ve Harita Alanı */}
      <div className="relative flex-1 bg-[radial-gradient(#064e3b_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden">
        {/* Radar Efekti - Taramalı Daireler */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[450px] h-[450px] rounded-full border border-emerald-500/40"></div>
          <div className="w-[300px] h-[300px] rounded-full border border-emerald-500/40 absolute"></div>
          <div className="w-[150px] h-[150px] rounded-full border border-emerald-500/40 absolute"></div>
        </div>

        {/* Araç Marker'ları */}
        {vehicleList.map((state) => {
          const t = state.latestTelemetry;
          if (!t) return null;

          const pos = getPositionPercent(t.latitude, t.longitude);
          const isSelected = state.vehicle.id === selectedVehicleId;

          return (
            <div
              key={state.vehicle.id}
              onClick={() => onSelectVehicle(state.vehicle.id)}
              style={{ left: pos.left, top: pos.top }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30 transition-all duration-500`}
            >
              {/* Seçili Araç Halesi */}
              {isSelected && (
                <div className="absolute -inset-3 rounded-full bg-emerald-500/20 border border-emerald-400 animate-ping"></div>
              )}

              {/* Araç İkon Kartı */}
              <div
                className={`p-2 rounded-lg border backdrop-blur flex items-center space-x-2 transition shadow-lg ${
                  isSelected
                    ? "bg-emerald-950/90 border-emerald-400 scale-110 shadow-emerald-500/30"
                    : "bg-slate-900/90 border-slate-700 hover:border-slate-500"
                }`}
              >
                {getVehicleIcon(state.vehicle.type)}
                <div className="text-left">
                  <div className="text-[11px] font-bold text-slate-100 whitespace-nowrap">
                    {state.vehicle.name}
                  </div>
                  <div className="text-[9px] font-mono text-emerald-400">
                    {t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seçili Araç Detay Alt Paneli */}
      {selectedVehicleState && selectedVehicleState.latestTelemetry && (
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex items-center justify-between z-20">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Seçili Hedef:</span>
            <h4 className="text-sm font-extrabold text-emerald-400">{selectedVehicleState.vehicle.name}</h4>
          </div>

          <div className="flex items-center space-x-6 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">İRTİFA</span>
              <span className="text-slate-200 font-bold">{selectedVehicleState.latestTelemetry.altitude} m</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">HIZ</span>
              <span className="text-slate-200 font-bold">{selectedVehicleState.latestTelemetry.speed} km/h</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">BATARYA</span>
              <span className={`font-bold ${selectedVehicleState.latestTelemetry.batteryPercentage < 20 ? "text-rose-400" : "text-emerald-400"}`}>
                %{selectedVehicleState.latestTelemetry.batteryPercentage}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">SICAKLIK</span>
              <span className="text-slate-200 font-bold">{selectedVehicleState.latestTelemetry.temperature} °C</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
