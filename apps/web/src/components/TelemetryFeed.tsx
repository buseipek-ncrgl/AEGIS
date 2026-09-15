"use client";

import { TelemetryDto } from "@/types/telemetry";
import { Terminal, Radio } from "lucide-react";

interface TelemetryFeedProps {
  telemetryLogs: { telemetry: TelemetryDto; vehicleName: string }[];
}

export default function TelemetryFeed({ telemetryLogs }: TelemetryFeedProps) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[280px]">
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
            Canlı Telemetri Paket Akışı (SignalR Websocket)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <Radio className="w-3 h-3 animate-pulse" /> Akış Aktif
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 bg-slate-950">
        {telemetryLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            Canlı paket bekleniyor... Simülatör çalıştırıldığında veriler anlık buraya düşecektir.
          </div>
        ) : (
          telemetryLogs.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between border-b border-slate-900/80 pb-1 hover:bg-slate-900/40 transition px-2 py-0.5 rounded">
              <div className="flex items-center space-x-3">
                <span className="text-slate-500 text-[10px]">
                  [{new Date(item.telemetry.timestamp).toLocaleTimeString("tr-TR")}]
                </span>
                <span className="font-bold text-emerald-400">{item.vehicleName}</span>
                <span className="text-slate-300">
                  Enlem: {item.telemetry.latitude.toFixed(4)}, Boylam: {item.telemetry.longitude.toFixed(4)}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
                <span>İrtifa: <strong className="text-slate-200">{item.telemetry.altitude}m</strong></span>
                <span>Hız: <strong className="text-slate-200">{item.telemetry.speed}km/h</strong></span>
                <span className={item.telemetry.batteryPercentage < 20 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  %{item.telemetry.batteryPercentage}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
