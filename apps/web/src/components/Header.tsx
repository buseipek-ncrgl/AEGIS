"use client";

import { useState, useEffect } from "react";
import { Shield, Radio, Activity, Clock, Layers } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  activeVehiclesCount: number;
  totalTelemetryCount: number;
}

export default function Header({ isConnected, activeVehiclesCount, totalTelemetryCount }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("tr-TR"));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString("tr-TR"));
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-950/90 backdrop-blur border-b border-slate-800 text-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Sol Logo & Başlık */}
      <div className="flex items-center space-x-3">
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              AEGIS COMMAND CENTER
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
              v1.0 Core
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Gerçek Zamanlı Komuta, Kontrol & Sensör Takip Platformu (Türkiye Senaryoları)
          </p>
        </div>
      </div>

      {/* Orta / Sağ Durum Göstergeleri */}
      <div className="flex items-center space-x-6">
        {/* SignalR Canlı Yayın Bağlantı Durumu */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <Radio className={`w-4 h-4 ${isConnected ? "text-emerald-400 animate-pulse" : "text-amber-500"}`} />
          <span className="text-slate-400">SignalR Hat:</span>
          <span className={`font-semibold ${isConnected ? "text-emerald-400" : "text-amber-500"}`}>
            {isConnected ? "CANLI (CONNECTED)" : "BAĞLANIYOR..."}
          </span>
        </div>

        {/* Aktif Araç Sayısı */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Aktif Araç:</span>
          <span className="font-bold text-cyan-400">{activeVehiclesCount}</span>
        </div>

        {/* Toplam Telemetri Sayısı */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <Activity className="w-4 h-4 text-teal-400" />
          <span className="text-slate-400">Gelen Akış:</span>
          <span className="font-bold text-teal-400">{totalTelemetryCount}</span>
        </div>

        {/* Sistem Saati */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300 font-mono">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{currentTime || "00:00:00"}</span>
        </div>
      </div>
    </header>
  );
}
