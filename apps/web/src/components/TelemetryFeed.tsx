"use client";

import { TelemetryDto, AnomalyType } from "@/types/telemetry";
import { Terminal, Radio, AlertTriangle, ShieldAlert, Download } from "lucide-react";

interface TelemetryFeedProps {
  telemetryLogs: { telemetry: TelemetryDto; vehicleName: string }[];
}

export default function TelemetryFeed({ telemetryLogs }: TelemetryFeedProps) {
  const getAnomalyBadge = (type: AnomalyType) => {
    switch (type) {
      case AnomalyType.GpsSpoofing:
        return (
          <span className="bg-purple-950/80 text-purple-300 border border-purple-700 text-[10px] px-2 py-0.5 rounded font-sans font-bold flex items-center gap-1 animate-pulse">
            <ShieldAlert className="w-3 h-3 text-purple-400" /> GPS SPOOFING
          </span>
        );
      case AnomalyType.SuddenFreefall:
        return (
          <span className="bg-rose-950/80 text-rose-300 border border-rose-700 text-[10px] px-2 py-0.5 rounded font-sans font-bold flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> DÜŞÜŞ TEHLİKESİ
          </span>
        );
      case AnomalyType.ThermalRunaway:
        return (
          <span className="bg-amber-950/80 text-amber-300 border border-amber-700 text-[10px] px-2 py-0.5 rounded font-sans font-bold flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> TERMAL KAÇIŞ
          </span>
        );
      default:
        return null;
    }
  };

  const exportCsvReport = () => {
    if (telemetryLogs.length === 0) return;

    const headers = ["Zaman", "Araç İsmi", "Enlem", "Boylam", "İrtifa (m)", "Hız (km/h)", "Batarya (%)", "AI Anomali"];
    const rows = telemetryLogs.map((item) => {
      const anomaliesStr = item.telemetry.anomalies
        ? item.telemetry.anomalies.map((a) => a.description.replace(/,/g, " ")).join("; ")
        : "Yok";
      return [
        new Date(item.telemetry.timestamp).toLocaleTimeString("tr-TR"),
        item.vehicleName,
        item.telemetry.latitude.toFixed(6),
        item.telemetry.longitude.toFixed(6),
        item.telemetry.altitude,
        item.telemetry.speed,
        item.telemetry.batteryPercentage,
        `"${anomaliesStr}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AEGIS_TAKTIK_UCUS_RAPORU_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="c4isr-glass-panel rounded-2xl overflow-hidden flex flex-col h-[280px] font-mono border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
      <div className="bg-[#090e1a]/95 px-4 py-2.5 border-b border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-black text-cyan-300 tracking-widest uppercase">
            LIVE TELEMETRY & KINEMATIC ANOMALY FEED (SIGNALR BUS)
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          {telemetryLogs.length > 0 && (
            <button
              onClick={exportCsvReport}
              className="bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition shadow-[0_0_12px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer"
              title="After-Action Report (AAR) CSV İndir"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> AAR CSV EXPORT
            </button>
          )}

          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse text-emerald-400" /> STREAM ACTIVE
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 bg-[#050913]/90">
        {telemetryLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Awaiting real-time telemetry packets... Start Python Simulator to feed telemetry.
          </div>
        ) : (
          telemetryLogs.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between border-b border-slate-800/60 pb-1.5 hover:bg-[#0c1428] transition px-2.5 py-1 rounded-lg ${
                item.telemetry.anomalies && item.telemetry.anomalies.length > 0
                  ? "bg-rose-950/40 border-l-4 border-l-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-slate-500 text-[10px]">
                  [{new Date(item.telemetry.timestamp).toLocaleTimeString("tr-TR")}]
                </span>
                <span className="font-extrabold text-cyan-300 tracking-wider">{item.vehicleName}</span>
                <span className="text-slate-400 text-[11px]">
                  LAT: <strong className="text-slate-200">{item.telemetry.latitude.toFixed(4)}</strong> LON: <strong className="text-slate-200">{item.telemetry.longitude.toFixed(4)}</strong>
                </span>
                {item.telemetry.anomalies &&
                  item.telemetry.anomalies.map((a, aIdx) => (
                    <span key={aIdx}>{getAnomalyBadge(a.anomalyType)}</span>
                  ))}
              </div>

              <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
                <span>
                  ALT: <strong className="text-emerald-400 font-bold">{item.telemetry.altitude}m</strong>
                </span>
                <span>
                  SPD: <strong className="text-amber-400 font-bold">{item.telemetry.speed}km/h</strong>
                </span>
                <span className={item.telemetry.batteryPercentage < 20 ? "text-rose-400 font-bold animate-pulse" : "text-cyan-300 font-bold"}>
                  BAT: %{item.telemetry.batteryPercentage}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
