"use client";

import { AlertDto, AlertSeverity } from "@/types/alert";
import { AlertTriangle, ShieldAlert, CheckCircle2, Bot, Target } from "lucide-react";

interface AlertBannerProps {
  alerts: AlertDto[];
  onAcknowledgeAlert: (id: string) => void;
  latestAiAnomalyMessage?: string | null;
}

export default function AlertBanner({ alerts, onAcknowledgeAlert, latestAiAnomalyMessage }: AlertBannerProps) {
  const activeAlerts = alerts.filter((a) => !a.isAcknowledged);

  if (activeAlerts.length === 0 && !latestAiAnomalyMessage) return null;

  return (
    <div className="space-y-2 mb-4 animate-fadeIn">
      {/* Canlı AI Anomali Tehdit Bildirimi */}
      {latestAiAnomalyMessage && (
        <div className="px-4 py-3 rounded-xl border border-purple-500/80 bg-purple-950/90 text-purple-100 shadow-[0_0_25px_rgba(168,85,247,0.4)] backdrop-blur flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Bot className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                  🤖 YAPAY ZEKA ANOMALİ ALARMI (AI ANOMALY DETECTED)
                </span>
                <span className="text-[10px] font-mono bg-purple-900 border border-purple-700 px-1.5 py-0.5 rounded text-purple-200">
                  Haversine Kinematik Model
                </span>
              </div>
              <p className="text-xs font-semibold mt-0.5">{latestAiAnomalyMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Taktik Sistem Alarmları */}
      {activeAlerts.slice(0, 3).map((alert) => {
        const isCritical = alert.severity === AlertSeverity.Critical;

        return (
          <div
            key={alert.id}
            className={`px-4 py-3 rounded-xl border backdrop-blur flex items-center justify-between shadow-lg transition-all ${
              isCritical
                ? "bg-rose-950/90 border-rose-500/80 text-rose-100 animate-pulse shadow-rose-900/40"
                : "bg-amber-950/90 border-amber-500/80 text-amber-100 shadow-amber-900/40"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  isCritical ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {isCritical ? (
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <span>{isCritical ? "🚨 KRİTİK TAKTİK ALARM" : "⚠️ UYARI BİLDİRİMİ"}</span>
                    {alert.vehicleName && alert.vehicleName !== "Bilinmeyen Araç / Taktik Komuta" && (
                      <span className="bg-rose-900/80 text-rose-200 border border-rose-600 px-2 py-0.5 rounded font-mono text-[10px] font-bold flex items-center gap-1">
                        <Target className="w-3 h-3 text-rose-300" /> {alert.vehicleName}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-mono opacity-75">
                    ({new Date(alert.createdAt).toLocaleTimeString("tr-TR")})
                  </span>
                </div>
                <p className="text-xs font-semibold mt-0.5">{alert.message}</p>
              </div>
            </div>

            <button
              onClick={() => onAcknowledgeAlert(alert.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isCritical
                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                  : "bg-amber-600 hover:bg-amber-500 text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Anlaşıldı</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
