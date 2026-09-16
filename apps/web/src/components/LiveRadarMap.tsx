"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { TrackedVehicleState, TelemetryDto } from "@/types/telemetry";
import { MapPin, Navigation } from "lucide-react";

// Leaflet GIS Haritasını SSR olmadan dinamik yükle
const GisMap = dynamic(() => import("./GisMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
      GIS Sokak & Uydu Haritası Yükleniyor...
    </div>
  ),
});

interface LiveRadarMapProps {
  trackedVehicles: Map<string, TrackedVehicleState>;
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  playbackTelemetry?: TelemetryDto | null;
}

export default function LiveRadarMap({
  trackedVehicles,
  selectedVehicleId,
  onSelectVehicle,
  playbackTelemetry,
}: LiveRadarMapProps) {
  const [mapMode, setMapMode] = useState<"REAL_GIS" | "RADAR_GRID">("REAL_GIS");

  const [radarPan, setRadarPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [radarZoom, setRadarZoom] = useState<number>(1.0);
  const [isDraggingRadar, setIsDraggingRadar] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const vehicleList = Array.from(trackedVehicles.values());
  const selectedVehicleState = selectedVehicleId ? trackedVehicles.get(selectedVehicleId) : null;
  const activeTelemetry = playbackTelemetry || selectedVehicleState?.latestTelemetry;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingRadar(true);
    setDragStart({ x: e.clientX - radarPan.x, y: e.clientY - radarPan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRadar) return;
    setRadarPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDraggingRadar(false);

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setRadarZoom((prev) => Math.min(3.5, Math.max(0.4, prev + delta)));
  };

  const resetRadarView = () => {
    setRadarPan({ x: 0, y: 0 });
    setRadarZoom(1.0);
  };

  return (
    <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-[550px] flex flex-col select-none">
      {/* Harita Üst Kontrol Barı */}
      <div className="bg-slate-900/90 backdrop-blur px-4 py-2 border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">
            {mapMode === "REAL_GIS"
              ? "Gerçek GIS Sokak & Arazi Haritası (OpenStreetMap / Esri Dark)"
              : "Taktik Radar Izgara Ekranı (İnteraktif Sürüklenebilir)"}
          </span>
        </div>

        {/* Görünüm Modu Değiştirme Butonları */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMapMode("REAL_GIS")}
            className={`px-3 py-1 text-[11px] font-bold rounded transition flex items-center gap-1 ${
              mapMode === "REAL_GIS" ? "bg-emerald-600 text-white shadow-lg" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🗺️ Gerçek GIS Haritası
          </button>
          <button
            onClick={() => setMapMode("RADAR_GRID")}
            className={`px-3 py-1 text-[11px] font-bold rounded transition flex items-center gap-1 ${
              mapMode === "RADAR_GRID" ? "bg-emerald-600 text-white shadow-lg" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            📡 Taktik Radar Izgarası
          </button>
        </div>
      </div>

      {/* Harita / Radar Ekran Alanı */}
      <div className="relative flex-1 overflow-hidden">
        {mapMode === "REAL_GIS" ? (
          <GisMap
            trackedVehicles={trackedVehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={onSelectVehicle}
            playbackTelemetry={playbackTelemetry}
          />
        ) : (
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className={`relative w-full h-full bg-[radial-gradient(#064e3b_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden ${
              isDraggingRadar ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <div className="absolute top-3 right-3 z-30 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-1 flex space-x-1 shadow-lg">
              <button
                onClick={() => setRadarZoom((z) => Math.min(3.5, z + 0.2))}
                className="px-2 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
              >
                ➕
              </button>
              <button
                onClick={() => setRadarZoom((z) => Math.max(0.4, z - 0.2))}
                className="px-2 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
              >
                ➖
              </button>
              <button
                onClick={resetRadarView}
                className="px-2 py-1 text-[10px] font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded"
              >
                🎯 Sıfırla
              </button>
            </div>

            <div
              style={{
                transform: `translate(${radarPan.x}px, ${radarPan.y}px) scale(${radarZoom})`,
                transformOrigin: "center center",
                transition: isDraggingRadar ? "none" : "transform 0.1s ease-out",
              }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                <div className="w-[600px] h-[600px] rounded-full border border-emerald-500/50"></div>
                <div className="w-[450px] h-[450px] rounded-full border border-emerald-500/50 absolute"></div>
                <div className="w-[300px] h-[300px] rounded-full border border-emerald-500/50 absolute"></div>
                <div className="w-[150px] h-[150px] rounded-full border border-emerald-500/50 absolute"></div>
                <div className="w-full h-[1px] bg-emerald-500/30 absolute"></div>
                <div className="h-full w-[1px] bg-emerald-500/30 absolute"></div>
              </div>

              {vehicleList.map((state) => {
                const isSelected = state.vehicle.id === selectedVehicleId;
                const t = isSelected && playbackTelemetry ? playbackTelemetry : state.latestTelemetry;
                if (!t) return null;

                const left = `${Math.max(10, Math.min(90, ((t.longitude - 27.0) / 6.0) * 100))}%`;
                const top = `${Math.max(10, Math.min(90, 100 - ((t.latitude - 38.0) / 2.2) * 100))}%`;

                return (
                  <div
                    key={state.vehicle.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVehicle(state.vehicle.id);
                    }}
                    style={{ left, top }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 transition-all duration-300"
                  >
                    <div
                      className={`p-2 rounded-lg border backdrop-blur flex items-center space-x-2 transition ${
                        isSelected
                          ? "bg-emerald-950/90 border-emerald-400 scale-110 shadow-lg shadow-emerald-500/30"
                          : "bg-slate-900/90 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <Navigation className={`w-4 h-4 ${isSelected ? "text-emerald-300 animate-pulse" : "text-emerald-400"}`} />
                      <span className="text-[11px] font-bold text-slate-100">{state.vehicle.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Seçili Araç Detay Alt Paneli */}
      {selectedVehicleState && activeTelemetry && (
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-2.5 flex items-center justify-between z-20">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              {playbackTelemetry ? "⏪ Uçuş Geçmişi Konumu:" : "Seçili Canlı Hedef:"}
            </span>
            <h4 className="text-sm font-extrabold text-emerald-400">{selectedVehicleState.vehicle.name}</h4>
          </div>

          <div className="flex items-center space-x-6 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">ENLEM / BOYLAM</span>
              <span className="text-slate-200 font-bold">
                {activeTelemetry.latitude.toFixed(4)}, {activeTelemetry.longitude.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">İRTİFA</span>
              <span className="text-slate-200 font-bold">{activeTelemetry.altitude} m</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">HIZ</span>
              <span className="text-slate-200 font-bold">{activeTelemetry.speed} km/h</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">BATARYA</span>
              <span className={`font-bold ${activeTelemetry.batteryPercentage < 20 ? "text-rose-400" : "text-emerald-400"}`}>
                %{activeTelemetry.batteryPercentage}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
