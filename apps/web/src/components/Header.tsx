"use client";

import { useState, useEffect } from "react";
import { Shield, Radio, Activity, Clock, Layers, Lock, UserCheck, RadioTower } from "lucide-react";
import AuthModal from "./AuthModal";

interface HeaderProps {
  isConnected: boolean;
  activeVehiclesCount: number;
  totalTelemetryCount: number;
  jwtToken: string | null;
  operatorUser: string | null;
  onLoginSuccess: (token: string, username: string) => void;
  onLogout: () => void;
  onOpenManualAlertModal: () => void;
}

export default function Header({
  isConnected,
  activeVehiclesCount,
  totalTelemetryCount,
  jwtToken,
  operatorUser,
  onLoginSuccess,
  onLogout,
  onOpenManualAlertModal,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("tr-TR"));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString("tr-TR"));
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header className="c4isr-glass-header text-slate-100 px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-0 z-50">
        {/* Sol Logo & Başlık */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-500/10 border border-cyan-500/40 p-2 rounded-lg text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-xl font-black tracking-widest bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent uppercase drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  AEGIS TAKTİK KOMUTA MERKEZİ
                </h1>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold tracking-widest bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  SAVUNMA v3.0
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono hidden sm:flex items-center space-x-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>CANLI HAVA SAVUNMA VE KİNEMATİK ANOMALİ TESPİT PLATFORMU</span>
              </p>
            </div>
          </div>
        </div>

        {/* Orta / Sağ Durum Göstergeleri */}
        <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 sm:gap-3 w-full md:w-auto text-xs font-mono">
          {/* Taktik Müdahale / Manuel Alarm Butonu (Sadece Operatör Giriş Yapmışsa Aktif) */}
          {jwtToken ? (
            <button
              onClick={onOpenManualAlertModal}
              className="flex items-center space-x-1.5 bg-rose-950/90 hover:bg-rose-900 border border-rose-500/60 px-3 py-1.5 rounded-lg text-rose-300 transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] active:scale-95 animate-pulse cursor-pointer"
              title="Taktik Alarm Fırlat (Operatör Yetkili)"
            >
              <RadioTower className="w-4 h-4 text-rose-400" />
              <span className="font-extrabold text-[11px] sm:text-xs tracking-wider">TAKİK ALARM FIRLAT</span>
            </button>
          ) : (
            <div
              className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 opacity-60 px-2.5 py-1.5 rounded-lg text-slate-500 cursor-not-allowed"
              title="Taktik Alarm fırlatmak için Operatör olarak giriş yapın"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-[11px] sm:text-xs">Taktik Alarm (Kilitli)</span>
            </div>
          )}

          {/* JWT Operatör Kimlik Butonu */}
          {jwtToken ? (
            <button
              onClick={onLogout}
              className="flex items-center space-x-1.5 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 px-3 py-1.5 rounded-lg text-emerald-300 transition-colors shadow-[0_0_12px_rgba(16,185,129,0.25)] cursor-pointer"
              title="Oturumu Kapat"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-[11px] sm:text-xs">
                {operatorUser || "Operatör"} (Çıkış Yap)
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-1.5 bg-amber-950/80 hover:bg-amber-900/90 border border-amber-500/60 px-3 py-1.5 rounded-lg text-amber-300 transition-colors shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-[11px] sm:text-xs">OPERATÖR GİRİŞİ (JWT)</span>
            </button>
          )}

          {/* SignalR Canlı Yayın Bağlantı Durumu */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700/60 px-2.5 py-1.5 rounded-lg">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? "text-emerald-400 animate-pulse" : "text-amber-500"}`} />
            <span className="text-slate-400 hidden sm:inline">SignalR:</span>
            <span className={`font-bold text-[11px] sm:text-xs ${isConnected ? "text-emerald-400" : "text-amber-500"}`}>
              {isConnected ? "CANLI" : "BAĞLANIYOR..."}
            </span>
          </div>

          {/* Aktif Araç Sayısı */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700/60 px-2.5 py-1.5 rounded-lg">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px] sm:text-xs">Üniteler:</span>
            <span className="font-bold text-cyan-400 text-[11px] sm:text-xs">{activeVehiclesCount}</span>
          </div>

          {/* Toplam Telemetri Sayısı */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700/60 px-2.5 py-1.5 rounded-lg">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-400 text-[11px] sm:text-xs">Paket:</span>
            <span className="font-bold text-teal-400 text-[11px] sm:text-xs">{totalTelemetryCount}</span>
          </div>

          {/* Sistem Saati */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-cyan-500/30 px-2.5 py-1.5 rounded-lg text-cyan-300 font-mono text-[11px] sm:text-xs shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentTime || "00:00:00"}</span>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={onLoginSuccess}
      />
    </>
  );
}
