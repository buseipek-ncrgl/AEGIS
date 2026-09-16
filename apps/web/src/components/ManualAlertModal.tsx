"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Send, X, ShieldAlert, Radio } from "lucide-react";
import { TrackedVehicleState } from "@/types/telemetry";

interface ManualAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  jwtToken: string | null;
  trackedVehicles: Map<string, TrackedVehicleState>;
  onAlertSent?: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ManualAlertModal({
  isOpen,
  onClose,
  jwtToken,
  trackedVehicles,
  onAlertSent,
}: ManualAlertModalProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [severity, setSeverity] = useState<number>(3); // 3 = Critical, 2 = Warning, 1 = Info
  const [alertType, setAlertType] = useState<number>(1);
  const [message, setMessage] = useState<string>("⚠️ Taktik Komuta Tarafından Manuel Tehdit Uyarısı Fırlatıldı!");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal her açıldığında eski hata ve başarı mesajlarını temizle
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const vehicleOptions = Array.from(trackedVehicles.values()).map((state) => state.vehicle);
  const selectedVehicleObj = vehicleOptions.find((v) => v.id === selectedVehicleId);

  const presetMessages = [
    "🚨 MANUEL UYARI: Bölgede Yetkisiz Düşman İHA Saptandı!",
    "⚠️ TAKTİK İKAZ: İHA İrtifa Kaybı - Acil İniş İkazı!",
    "🔥 TERMAL ALARM: Motor Sıcaklığı Kritik Seviyede!",
    "🚨 ACİL TAHLİYE: Yasaklı Bölge (No-Fly Zone) İhlali!",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!jwtToken) {
      setError("Yetkisiz İstek! Bu işlem için Operatör yetkisi gereklidir. Lütfen Operatör olarak giriş yapın.");
      return;
    }

    setLoading(true);

    try {
      let finalMessage = message;
      if (selectedVehicleObj && !finalMessage.includes(selectedVehicleObj.name)) {
        finalMessage = `🎯 [HEDEF: ${selectedVehicleObj.name}] - ${message}`;
      }

      const payload = {
        vehicleId: selectedVehicleId || null,
        severity: Number(severity),
        type: Number(alertType),
        message: finalMessage,
      };

      const res = await fetch(`${API_BASE_URL}/alerts/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Yetkisiz İstek! Bu işlem için Operatör rolüyle giriş yapılmış olmalıdır.");
        }
        throw new Error("Alarm fırlatılırken sunucu hatası oluştu.");
      }

      setSuccessMsg(`Taktik alarm ${selectedVehicleObj ? selectedVehicleObj.name + ' aracına' : 'tüm sisteme'} başarıyla fırlatıldı!`);
      if (onAlertSent) onAlertSent();
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Alarm fırlatılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-rose-900/60 rounded-2xl p-6 w-full max-w-lg shadow-[0_0_50px_rgba(225,29,72,0.3)] relative text-slate-100 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="bg-rose-500/20 border border-rose-500/40 p-3 rounded-xl text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Taktik Müdahale & Manuel Alarm</span>
              <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-mono uppercase">
                OPERATÖR
              </span>
            </h2>
            <p className="text-xs text-slate-400">Canlı Radar Ekranlarına Anlık İkaz ve Siren Fırlat</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-rose-950/80 border border-rose-700 text-rose-200 text-xs p-3 rounded-xl flex items-center space-x-2 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs p-3 rounded-xl flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Targeted Hedef Araç (Opsiyonel)</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none transition-colors"
            >
              <option value="">-- Tüm Sistem / Genel Komuta İkazı --</option>
              {vehicleOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  🎯 {v.name} ({v.id.substring(0, 8)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ciddiyet Seviyesi</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 text-slate-100 text-xs rounded-xl px-3 py-2 outline-none transition-colors"
              >
                <option value={3}>🚨 KRİTİK (Critical)</option>
                <option value={2}>⚠️ UYARI (Warning)</option>
                <option value={1}>ℹ️ BİLGİ (Info)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Alarm Tipi</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 text-slate-100 text-xs rounded-xl px-3 py-2 outline-none transition-colors"
              >
                <option value={1}>Düşük Batarya</option>
                <option value={2}>Tehlikeli İrtifa</option>
                <option value={3}>Geofence İhlali</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hazır İkaz Şablonları</label>
            <div className="grid grid-cols-1 gap-1.5 mb-2">
              {presetMessages.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setMessage(preset)}
                  className="text-left text-[11px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg transition-colors truncate"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Alarm Mesajı</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 text-slate-100 text-xs rounded-xl p-3 outline-none transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-slate-100 font-bold py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>
                {loading
                  ? "Fırlatılıyor..."
                  : selectedVehicleObj
                  ? `${selectedVehicleObj.name} Araç İkazı Fırlat`
                  : "Taktik Alarmı Canlı Fırlat"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
