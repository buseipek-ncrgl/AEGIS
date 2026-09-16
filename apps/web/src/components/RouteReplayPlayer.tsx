"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, FastForward, Navigation, X } from "lucide-react";
import { TrackedVehicleState, TelemetryDto } from "@/types/telemetry";

interface RouteReplayPlayerProps {
  selectedVehicleState: TrackedVehicleState | null;
  onClose: () => void;
  onPlaybackPointChange?: (point: TelemetryDto | null) => void;
}

export default function RouteReplayPlayer({
  selectedVehicleState,
  onClose,
  onPlaybackPointChange,
}: RouteReplayPlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1);

  const history = selectedVehicleState?.telemetryHistory || [];
  // Uçuş sırasına göre kronolojik sıralama (eskiden yeniye)
  const sortedHistory = [...history].reverse();

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && sortedHistory.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= sortedHistory.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          if (onPlaybackPointChange) onPlaybackPointChange(sortedHistory[next]);
          return next;
        });
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, sortedHistory, speed, onPlaybackPointChange]);

  if (!selectedVehicleState || sortedHistory.length === 0) return null;

  const currentPoint = sortedHistory[currentIndex] || sortedHistory[0];

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = Number(e.target.value);
    setCurrentIndex(idx);
    if (onPlaybackPointChange) onPlaybackPointChange(sortedHistory[idx]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    if (onPlaybackPointChange) onPlaybackPointChange(sortedHistory[0]);
  };

  return (
    <div className="c4isr-glass-panel rounded-2xl p-3.5 shadow-[0_0_30px_rgba(6,182,212,0.25)] text-slate-100 font-mono border border-cyan-500/40">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-cyan-400 animate-spin" />
          <h4 className="text-xs font-black text-cyan-300 tracking-wider">
            UÇUŞ ROTA GEÇMİŞİ VE OYNATICI: <span className="text-slate-100">{selectedVehicleState.vehicle.name}</span>
          </h4>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col space-y-2.5">
        {/* Zaman Çubuğu (Slider) */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-mono text-[10px] text-slate-400 shrink-0 font-bold">
            {currentIndex + 1} / {sortedHistory.length} PAKET
          </span>
          <input
            type="range"
            min={0}
            max={sortedHistory.length - 1}
            value={currentIndex}
            onChange={handleSeek}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg border border-cyan-500/30"
          />
          <span className="font-mono text-[10px] text-cyan-300 font-bold shrink-0">
            {currentPoint ? new Date(currentPoint.timestamp).toLocaleTimeString("tr-TR") : "--:--"}
          </span>
        </div>

        {/* Kontrol Butonları */}
        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3.5 py-1 rounded-lg flex items-center space-x-1.5 font-extrabold transition shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "DURDUR" : "OYNAT"}</span>
            </button>

            <button
              onClick={handleReset}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg flex items-center space-x-1 transition text-[11px] cursor-pointer"
              title="Başa Sar"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Oynatma Hızı */}
          <div className="flex items-center space-x-1 text-[11px] bg-[#050913] px-2.5 py-1 rounded-lg border border-cyan-500/30">
            <FastForward className="w-3 h-3 text-cyan-400" />
            <button
              onClick={() => setSpeed(1)}
              className={`px-1.5 rounded font-bold cursor-pointer ${speed === 1 ? "bg-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "text-slate-400"}`}
            >
              1x
            </button>
            <button
              onClick={() => setSpeed(2)}
              className={`px-1.5 rounded font-bold cursor-pointer ${speed === 2 ? "bg-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "text-slate-400"}`}
            >
              2x
            </button>
            <button
              onClick={() => setSpeed(4)}
              className={`px-1.5 rounded font-bold cursor-pointer ${speed === 4 ? "bg-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "text-slate-400"}`}
            >
              4x
            </button>
          </div>

          {/* Anlık İrtifa & Hız Detayı */}
          {currentPoint && (
            <div className="hidden sm:flex items-center space-x-3 text-[11px] font-mono text-slate-300">
              <span>İRTİFA: <strong className="text-emerald-400 font-bold">{currentPoint.altitude}m</strong></span>
              <span>HIZ: <strong className="text-amber-400 font-bold">{currentPoint.speed}km/h</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
