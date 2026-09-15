"use client";

import { TrackedVehicleState, VehicleType } from "@/types/telemetry";
import { Plane, Ambulance, Navigation, Battery, Cpu, Activity } from "lucide-react";

interface VehicleListProps {
  trackedVehicles: Map<string, TrackedVehicleState>;
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
}

export default function VehicleList({ trackedVehicles, selectedVehicleId, onSelectVehicle }: VehicleListProps) {
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
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[550px]">
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
            Aktif Araç Filosu ({vehicleList.length})
          </h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {vehicleList.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            Henüz bağlı araç yok.<br />Simülatör başlatıldığında araçlar burada görünecektir.
          </div>
        ) : (
          vehicleList.map((state) => {
            const isSelected = state.vehicle.id === selectedVehicleId;
            const t = state.latestTelemetry;

            return (
              <div
                key={state.vehicle.id}
                onClick={() => onSelectVehicle(state.vehicle.id)}
                className={`p-3 rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? "bg-emerald-950/60 border-emerald-500 shadow-md"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-sm text-slate-100">{state.vehicle.name}</div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {getVehicleTypeName(state.vehicle.type)}
                  </span>
                </div>

                {t ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-900">
                      <div>ENLEM: <span className="text-slate-200">{t.latitude.toFixed(4)}</span></div>
                      <div>BOYLAM: <span className="text-slate-200">{t.longitude.toFixed(4)}</span></div>
                      <div>İRTİFA: <span className="text-slate-200">{t.altitude} m</span></div>
                      <div>HIZ: <span className="text-slate-200">{t.speed} km/h</span></div>
                    </div>

                    {/* Batarya Çubuğu */}
                    <div className="flex items-center space-x-2">
                      <Battery className={`w-4 h-4 ${t.batteryPercentage < 20 ? "text-rose-500" : "text-emerald-400"}`} />
                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            t.batteryPercentage < 20 ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${t.batteryPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-300">
                        %{t.batteryPercentage}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 font-mono">Telemetri verisi bekleniyor...</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
