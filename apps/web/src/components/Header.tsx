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
      <header className="bg-slate-950/90 backdrop-blur border-b border-slate-800 text-slate-100 px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-0 z-50">
        {/* Sol Logo & Başlık */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-xl font-extrabold tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  AEGIS COMMAND CENTER
                </h1>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 sm:px-2 py-0.5 rounded shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  v3.0 Enterprise
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">
                Taktik Komuta, Kontrol, Yapay Zeka Anomali & K8s Bulut Platformu
              </p>
            </div>
          </div>
        </div>

        {/* Orta / Sağ Durum Göstergeleri */}
        <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 sm:gap-3 w-full md:w-auto text-xs">
          {/* Taktik Müdahale / Manuel Alarm Butonu (Sadece Operatör Giriş Yapmışsa Aktif) */}
          {jwtToken ? (
            <button
              onClick={onOpenManualAlertModal}
              className="flex items-center space-x-1.5 bg-rose-950/90 hover:bg-rose-900 border border-rose-700/80 px-2.5 py-1 sm:py-1.5 rounded-lg text-rose-300 transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-95"
              title="Taktik Alarm Fırlat (Operatör Yetkili)"
            >
              <RadioTower className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="font-bold text-[11px] sm:text-xs">TAKİK ALARM</span>
            </button>
          ) : (
            <div
              className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 opacity-60 px-2.5 py-1 sm:py-1.5 rounded-lg text-slate-500 cursor-not-allowed"
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
              className="flex items-center space-x-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 px-2.5 py-1 sm:py-1.5 rounded-lg text-emerald-300 transition-colors"
              title="Oturumu Kapat"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-[11px] sm:text-xs">
                {operatorUser || "Operatör"} (Çıkış Yap)
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-1.5 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/80 px-2.5 py-1 sm:py-1.5 rounded-lg text-amber-300 transition-colors animate-pulse"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-[11px] sm:text-xs">Giriş Yap (JWT)</span>
            </button>
          )}

          {/* SignalR Canlı Yayın Bağlantı Durumu */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-900 border border-slate-800 px-2.5 py-1 sm:py-1.5 rounded-lg">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? "text-emerald-400 animate-pulse" : "text-amber-500"}`} />
            <span className="text-slate-400 hidden sm:inline">SignalR:</span>
            <span className={`font-semibold text-[11px] sm:text-xs ${isConnected ? "text-emerald-400" : "text-amber-500"}`}>
              {isConnected ? "CANLI" : "BAĞLANIYOR..."}
            </span>
          </div>

          {/* Aktif Araç Sayısı */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-900 border border-slate-800 px-2.5 py-1 sm:py-1.5 rounded-lg">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px] sm:text-xs">Araç:</span>
            <span className="font-bold text-cyan-400 text-[11px] sm:text-xs">{activeVehiclesCount}</span>
          </div>

          {/* Toplam Telemetri Sayısı */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-900 border border-slate-800 px-2.5 py-1 sm:py-1.5 rounded-lg">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-400 text-[11px] sm:text-xs">Akış:</span>
            <span className="font-bold text-teal-400 text-[11px] sm:text-xs">{totalTelemetryCount}</span>
          </div>

          {/* Sistem Saati */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-900 border border-slate-800 px-2.5 py-1 sm:py-1.5 rounded-lg text-slate-300 font-mono text-[11px] sm:text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
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
