"use client";

import { useState } from "react";
import { Shield, Lock, KeyRound, Eye, Radio, ShieldCheck, AlertCircle } from "lucide-react";

interface C4IsrLoginGateProps {
  onLoginSuccess: (token: string, username: string) => void;
  onGuestAccess: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function C4IsrLoginGate({ onLoginSuccess, onGuestAccess }: C4IsrLoginGateProps) {
  const [username, setUsername] = useState<string>("operator");
  const [password, setPassword] = useState<string>("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Giriş başarısız! Geçersiz kullanıcı adı veya şifre.");
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Giriş başarısız.");

      localStorage.setItem("aegis_jwt_token", data.token);
      localStorage.setItem("aegis_operator_user", data.username || username);
      onLoginSuccess(data.token, data.username || username);
    } catch (err: any) {
      setError(err.message || "Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-black">
      {/* Taktik Izgara Arka Planı (Background Grid) */}
      <div className="absolute inset-0 bg-[radial-gradient(#064e3b_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none"></div>

      {/* Merkez Döner Taktik Halka */}
      <div className="absolute w-[600px] h-[600px] border border-emerald-500/10 rounded-full animate-spin pointer-events-none duration-[30s]"></div>
      <div className="absolute w-[400px] h-[400px] border border-cyan-500/10 rounded-full animate-pulse pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-[0_0_80px_rgba(16,185,129,0.15)] backdrop-blur-xl animate-in fade-in zoom-in duration-300">
        {/* Üst Kalkan İkonu & Başlık */}
        <div className="flex flex-col items-center text-center mb-6 space-y-3">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-pulse">
            <Shield className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent uppercase">
              AEGIS C4ISR PORTALI
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sıfır-Güven (Zero-Trust) Askeri & Sivil Hava Savunma Giriş Kapısı
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs p-3 rounded-xl flex items-center space-x-2 animate-pulse">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Kullanıcı Adı (Callsign)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm rounded-xl px-4 py-3 outline-none transition-colors"
              placeholder="operator, device veya guest"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Erişim Anahtarı / Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm rounded-xl px-4 py-3 outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-slate-950 font-black py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-2 text-sm uppercase tracking-wider"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? "Yetkilendiriliyor..." : "Komuta Ekranını Aç"}</span>
            </button>
          </div>
        </form>

        {/* Hızlı Rol Seçimi & Misafir Modu */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
          <div className="text-[10px] text-slate-500 uppercase font-bold text-center tracking-widest mb-2">
            Hızlı Test Rolü Seçin:
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setUsername("operator");
                setPassword("Password123!");
              }}
              className="bg-slate-950 hover:bg-slate-800 border border-emerald-900 text-emerald-400 p-2 rounded-xl text-left transition flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <div className="truncate">
                <div className="font-bold text-[11px]">🛡️ Operatör</div>
                <div className="text-[9px] text-slate-400 font-mono">Tam Yetki</div>
              </div>
            </button>

            <button
              type="button"
              onClick={onGuestAccess}
              className="bg-slate-950 hover:bg-slate-800 border border-cyan-900 text-cyan-400 p-2 rounded-xl text-left transition flex items-center space-x-1.5"
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <div className="truncate">
                <div className="font-bold text-[11px]">👁️ Misafir</div>
                <div className="text-[9px] text-slate-400 font-mono">Sadece İzleyici</div>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-5 text-[10px] text-slate-500 text-center flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>AES-256 / HMAC-SHA256 Güvenlikli C4ISR Protokolü</span>
        </div>
      </div>
    </div>
  );
}
