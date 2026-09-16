"use client";

import { TrackedVehicleState, VehicleType } from "@/types/telemetry";
import { Plane, Ambulance, Navigation, Battery, Cpu, Activity } from "lucide-react";

interface VehicleListProps {
  trackedVehicles: Map<string, TrackedVehicleState>;
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  onPlayRoute?: (id: string) => void;
  isFullView?: boolean;
}

export default function VehicleList({
  trackedVehicles,
  selectedVehicleId,
  onSelectVehicle,
  onPlayRoute,
  isFullView = false,
}: VehicleListProps) {
  const vehicleList = Array.from(trackedVehicles.values());

  const getVehicleTypeName = (type: VehicleType) => {
    switch (type) {
      case VehicleType.Drone:
        return "İHA (İnsansız Hava Aracı)";
      case VehicleType.Ambulance:
        return "Kara Ambulansı";
      case VehicleType.Helicopter:
        return "Arama Kurtarma Helikopteri";
      default:
        return "İnsansız Kara Aracı";
    }
  };

  return (
    <div
      className={`c4isr-glass-panel rounded-2xl overflow-hidden flex flex-col font-mono border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] ${
        isFullView ? "min-h-[680px]" : "h-[550px]"
      }`}
    >
      <div className="bg-[#090e1a]/95 px-4 py-3 border-b border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-black text-cyan-300 tracking-widest uppercase">
            {isFullView
              ? `TAKTİK FİLO VE ENVANTER KONSOLU (${vehicleList.length} ÜNİTE AKTİF)`
              : `AKTİF TAKTİK FİLO İZLERİ (${vehicleList.length})`}
          </h3>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
          {isFullView ? "FİLO KONSOLU" : "CANLI RADAR"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {vehicleList.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs font-mono">
            AKTİF RADAR İZİ BULUNAMADI.<br />Telemetri aktarımı için Python Simülatörünü başlatın.
          </div>
        ) : (
          vehicleList.map((state) => {
            const isSelected = state.vehicle.id === selectedVehicleId;
            const t = state.latestTelemetry;

            return (
              <div
                key={state.vehicle.id}
                onClick={() => onSelectVehicle(state.vehicle.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-950/70 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    : "bg-[#090e1c]/80 border-slate-800/90 hover:border-cyan-500/50 hover:bg-[#0c1428]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${t && t.batteryPercentage < 20 ? "bg-rose-500 animate-ping" : "bg-emerald-400 animate-pulse"}`}></span>
                    <div className="font-extrabold text-sm text-slate-100 tracking-wider">{state.vehicle.name}</div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-500/30 font-bold">
                    {getVehicleTypeName(state.vehicle.type)}
                  </span>
                </div>

                {t ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-400 bg-[#040710] p-2.5 rounded-lg border border-slate-800/80">
                      <div>ENLEM: <span className="text-cyan-300 font-bold">{t.latitude.toFixed(4)}</span></div>
                      <div>BOYLAM: <span className="text-cyan-300 font-bold">{t.longitude.toFixed(4)}</span></div>
                      <div>İRTİFA: <span className="text-emerald-400 font-bold">{t.altitude} m</span></div>
                      <div>HIZ: <span className="text-amber-400 font-bold">{t.speed} km/h</span></div>
                    </div>

                    {/* Batarya Çubuğu & Oynat Butonu */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-2 flex-1 mr-4">
                        <Battery className={`w-3.5 h-3.5 ${t.batteryPercentage < 20 ? "text-rose-500 animate-pulse" : "text-emerald-400"}`} />
                        <div className="flex-1 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-500 ${
                              t.batteryPercentage < 20 ? "bg-rose-500" : "bg-gradient-to-r from-teal-500 to-emerald-400"
                            }`}
                            style={{ width: `${t.batteryPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-300">
                          %{t.batteryPercentage}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVehicle(state.vehicle.id);
                          if (onPlayRoute) onPlayRoute(state.vehicle.id);
                        }}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                            : "bg-slate-900 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        }`}
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{onPlayRoute ? "▶️ HARİTADA OYNAT" : isSelected ? "⏪ OYNATICI AKTİF" : "▶️ ROTA OYNAT"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 font-mono">Telemetri paketleri bekleniyor...</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
