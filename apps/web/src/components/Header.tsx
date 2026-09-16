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
      <header className="c4isr-glass-header text-slate-100 px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-0 z-50 border-b border-cyan-500/30">
        {/* 1. SOL: Logo & Sistem Başlığı */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-500/10 border border-cyan-500/40 p-2 rounded-xl text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black tracking-widest bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent uppercase drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  AEGIS TAKTİK KOMUTA MERKEZİ
                </h1>
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  SAVUNMA v3.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:flex items-center space-x-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>CANLI HAVA SAVUNMA VE KİNEMATİK ANOMALİ TESPİT PLATFORMU</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2. ORTA: Sistem Canlılık ve Telemetri Durum Göstergeleri */}
        <div className="hidden lg:flex items-center space-x-2.5 font-mono text-xs">
          {/* SignalR Canlı Yayın Bağlantı Durumu */}
          <div className="flex items-center space-x-2 bg-[#050913]/90 border border-slate-700/60 px-3 py-1.5 rounded-xl shadow-inner">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? "text-emerald-400 animate-pulse" : "text-amber-500"}`} />
            <span className="text-slate-400">SignalR:</span>
            <span className={`font-bold text-[11px] ${isConnected ? "text-emerald-400" : "text-amber-500"}`}>
              {isConnected ? "CANLI" : "BAĞLANIYOR..."}
            </span>
          </div>

          {/* Aktif Araç Sayısı */}
          <div className="flex items-center space-x-2 bg-[#050913]/90 border border-slate-700/60 px-3 py-1.5 rounded-xl shadow-inner">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">Üniteler:</span>
            <span className="font-bold text-cyan-400 text-[11px]">{activeVehiclesCount}</span>
          </div>

          {/* Toplam Telemetri Sayısı */}
          <div className="flex items-center space-x-2 bg-[#050913]/90 border border-slate-700/60 px-3 py-1.5 rounded-xl shadow-inner">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-400 text-[11px]">Paket:</span>
            <span className="font-bold text-teal-400 text-[11px]">{totalTelemetryCount}</span>
          </div>

          {/* Sistem Saati */}
          <div className="flex items-center space-x-2 bg-[#050913]/90 border border-cyan-500/40 px-3 py-1.5 rounded-xl text-cyan-300 font-mono text-[11px] shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-black tracking-wider">{currentTime || "00:00:00"}</span>
          </div>
        </div>

        {/* 3. SAĞ: Operatör Kimliği & Taktik Alarm Aksiyonları */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end font-mono text-xs">
          {/* JWT Operatör Kimlik Butonu */}
          {jwtToken ? (
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 px-3.5 py-1.5 rounded-xl text-emerald-300 transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer active:scale-95"
              title="Oturumu Kapat"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <span className="block font-black text-[11px] leading-none text-emerald-200">{operatorUser || "Operatör"}</span>
                <span className="text-[9px] text-emerald-400 opacity-80 underline">Çıkış Yap</span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-2 bg-amber-950/90 hover:bg-amber-900 border border-amber-500/60 px-3.5 py-1.5 rounded-xl text-amber-300 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse cursor-pointer active:scale-95"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-[11px]">OPERATÖR GİRİŞİ (JWT)</span>
            </button>
          )}

          {/* Taktik Müdahale / Manuel Alarm Butonu */}
          {jwtToken ? (
            <button
              onClick={onOpenManualAlertModal}
              className="flex items-center space-x-2 bg-rose-950/90 hover:bg-rose-900 border border-rose-500/60 px-3.5 py-1.5 rounded-xl text-rose-300 transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] active:scale-95 animate-pulse cursor-pointer"
              title="Taktik Alarm Fırlat (Operatör Yetkili)"
            >
              <RadioTower className="w-4 h-4 text-rose-400" />
              <span className="font-extrabold text-[11px] tracking-wider">TAKİK ALARM FIRLAT</span>
            </button>
          ) : (
            <div
              className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 opacity-60 px-3 py-1.5 rounded-xl text-slate-500 cursor-not-allowed"
              title="Taktik Alarm fırlatmak için Operatör olarak giriş yapın"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-[11px]">Taktik Alarm (Kilitli)</span>
            </div>
          )}
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
