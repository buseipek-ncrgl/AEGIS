"use client";

import { useState } from "react";
import { AlertDto, AlertSeverity } from "@/types/alert";
import { AlertTriangle, ShieldAlert, CheckCircle2, Bot, Target, ChevronDown, ChevronUp, BellRing } from "lucide-react";

interface AlertBannerProps {
  alerts: AlertDto[];
  onAcknowledgeAlert: (id: string) => void;
  latestAiAnomalyMessage?: string | null;
}

export default function AlertBanner({ alerts, onAcknowledgeAlert, latestAiAnomalyMessage }: AlertBannerProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const activeAlerts = alerts.filter((a) => !a.isAcknowledged);

  if (activeAlerts.length === 0 && !latestAiAnomalyMessage) return null;

  const visibleAlerts = isExpanded ? activeAlerts : activeAlerts.slice(0, 1);
  const remainingCount = activeAlerts.length - 1;

  return (
    <div className="space-y-2 mb-4 animate-fadeIn font-mono">
      {/* Canlı AI Anomali Tehdit Bildirimi */}
      {latestAiAnomalyMessage && (
        <div className="px-4 py-3 rounded-2xl border border-purple-500/80 bg-purple-950/95 text-purple-100 shadow-[0_0_30px_rgba(168,85,247,0.5)] backdrop-blur-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
              <Bot className="w-5 h-5 animate-bounce text-purple-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-widest text-purple-300">
                  🤖 KİNEMATİK AI ANOMALİ ALARMI
                </span>
                <span className="text-[10px] font-mono bg-purple-900/90 border border-purple-600 px-2 py-0.5 rounded text-purple-200 font-bold">
                  HAVERSINE EW MOTORU
                </span>
              </div>
              <p className="text-xs font-bold mt-0.5 text-purple-100">{latestAiAnomalyMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Akıllı Taktik Sistem Alarmları Listesi */}
      {visibleAlerts.map((alert) => {
        const isCritical = alert.severity === AlertSeverity.Critical;

        return (
          <div
            key={alert.id}
            className={`px-4 py-3 rounded-2xl border backdrop-blur-xl flex items-center justify-between shadow-2xl transition-all ${
              isCritical
                ? "bg-rose-950/95 border-rose-500/90 text-rose-100 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.5)]"
                : "bg-amber-950/95 border-amber-500/90 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-2.5 rounded-xl border ${
                  isCritical
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                }`}
              >
                {isCritical ? (
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                ) : (
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <span>{isCritical ? "🚨 KRİTİK TAKTİK ALARM" : "⚠️ UYARI BİLDİRİMİ"}</span>
                    {alert.vehicleName && alert.vehicleName !== "Bilinmeyen Araç / Taktik Komuta" && (
                      <span className="bg-rose-900/90 text-rose-200 border border-rose-500/60 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                        <Target className="w-3 h-3 text-rose-300 animate-spin" /> {alert.vehicleName}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-mono opacity-75">
                    ({new Date(alert.createdAt).toLocaleTimeString("tr-TR")})
                  </span>
                </div>
                <p className="text-xs font-bold mt-0.5">{alert.message}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onAcknowledgeAlert(alert.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                  isCritical
                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                    : "bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ONAYLA (ANLAŞILDI)</span>
              </button>
            </div>
          </div>
        );
      })}

      {/* Ekran Yığılmasını Önleyen Akıllı Genişletme Barı */}
      {remainingCount > 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-1.5 px-4 bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs font-mono font-bold flex items-center justify-between transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        >
          <div className="flex items-center space-x-2">
            <BellRing className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>
              {isExpanded
                ? "Taktik Bildirim Listesini Daralt"
                : `+ ${remainingCount} Adet Bekleyen Taktik Alarm Daha Var (Tümünü Göster)`}
            </span>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

