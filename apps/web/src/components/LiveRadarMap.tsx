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
    <div className="relative c4isr-glass-panel border border-cyan-500/40 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.2)] h-[560px] flex flex-col select-none font-mono">
      {/* Harita Üst Kontrol Barı */}
      <div className="bg-[#090e1a]/95 backdrop-blur-md px-4 py-3 border-b border-cyan-500/30 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span className="text-xs font-black text-cyan-300 tracking-widest uppercase">
            {mapMode === "REAL_GIS"
              ? "CANLI GIS HAVA SAVUNMA VE HARİTA RADARI (OPENSTREETMAP / ESRI DARK)"
              : "İNTERAKTİF VEKTÖR TAKTİK RADAR IZGARASI"}
          </span>
        </div>

        {/* Görünüm Modu Değiştirme Butonları */}
        <div className="flex items-center space-x-2 font-mono">
          <button
            onClick={() => setMapMode("REAL_GIS")}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${
              mapMode === "REAL_GIS"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-cyan-300"
            }`}
          >
            🗺️ GERÇEK GIS HARİTASI
          </button>
          <button
            onClick={() => setMapMode("RADAR_GRID")}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${
              mapMode === "RADAR_GRID"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-cyan-300"
            }`}
          >
            📡 TAKTİK RADAR IZGARASI
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
            className={`relative w-full h-full bg-[#040814] bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden ${
              isDraggingRadar ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <div className="absolute top-4 right-4 z-30 bg-[#090e1a]/90 backdrop-blur border border-cyan-500/40 rounded-xl p-1 flex space-x-1 shadow-lg font-mono">
              <button
                onClick={() => setRadarZoom((z) => Math.min(3.5, z + 0.2))}
                className="px-2.5 py-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg cursor-pointer"
              >
                ➕
              </button>
              <button
                onClick={() => setRadarZoom((z) => Math.max(0.4, z - 0.2))}
                className="px-2.5 py-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg cursor-pointer"
              >
                ➖
              </button>
              <button
                onClick={resetRadarView}
                className="px-2.5 py-1 text-[10px] font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              >
                🎯 RESET
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
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                <div className="w-[650px] h-[650px] rounded-full border border-cyan-500/40 animate-radar-sweep">
                  <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-tl-full origin-bottom-right"></div>
                </div>
                <div className="w-[450px] h-[450px] rounded-full border border-cyan-500/40 absolute"></div>
                <div className="w-[300px] h-[300px] rounded-full border border-cyan-500/40 absolute"></div>
                <div className="w-[150px] h-[150px] rounded-full border border-cyan-500/40 absolute"></div>
                <div className="w-full h-[1px] bg-cyan-500/30 absolute"></div>
                <div className="h-full w-[1px] bg-cyan-500/30 absolute"></div>
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
                      className={`p-2.5 rounded-xl border backdrop-blur-md flex items-center space-x-2 transition ${
                        isSelected
                          ? "bg-cyan-950/95 border-cyan-400 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                          : "bg-[#090e1a]/90 border-slate-800 hover:border-cyan-500/50"
                      }`}
                    >
                      <Navigation className={`w-4 h-4 ${isSelected ? "text-cyan-300 animate-pulse" : "text-emerald-400"}`} />
                      <span className="text-[11px] font-extrabold text-slate-100 tracking-wider">{state.vehicle.name}</span>
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
        <div className="bg-[#090e1a]/95 border-t border-cyan-500/30 px-6 py-2.5 flex items-center justify-between z-20 font-mono">
          <div>
            <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-widest block">
              {playbackTelemetry ? "⏪ UÇUŞ GEÇMİŞİ HEDEFİ:" : "CANLI HEDEF KİLİTLENMESİ:"}
            </span>
            <h4 className="text-sm font-black text-cyan-300 tracking-wider">{selectedVehicleState.vehicle.name}</h4>
          </div>

          <div className="flex items-center space-x-6 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">ENLEM / BOYLAM</span>
              <span className="text-cyan-300 font-bold">
                {activeTelemetry.latitude.toFixed(4)}, {activeTelemetry.longitude.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">İRTİFA</span>
              <span className="text-emerald-400 font-bold">{activeTelemetry.altitude} m</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">HIZ</span>
              <span className="text-amber-400 font-bold">{activeTelemetry.speed} km/h</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">BATARYA</span>
              <span className={`font-bold ${activeTelemetry.batteryPercentage < 20 ? "text-rose-400 animate-pulse" : "text-cyan-300"}`}>
                %{activeTelemetry.batteryPercentage}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
