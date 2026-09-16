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
    <div className="min-h-screen bg-[#050913] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono selection:bg-cyan-500 selection:text-black">
      {/* Taktik Izgara Arka Planı (Background Grid) */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

      {/* Merkez Döner Taktik Radar Sweeper */}
      <div className="absolute w-[650px] h-[650px] border border-cyan-500/15 rounded-full animate-radar-sweep pointer-events-none">
        <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-tl-full origin-bottom-right"></div>
      </div>
      <div className="absolute w-[450px] h-[450px] border border-emerald-500/20 rounded-full animate-pulse pointer-events-none"></div>
      <div className="absolute w-[250px] h-[250px] border border-dashed border-teal-500/30 rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md bg-[#0a1020]/90 border border-cyan-500/30 rounded-3xl p-8 shadow-[0_0_80px_rgba(6,182,212,0.2)] backdrop-blur-2xl animate-in fade-in zoom-in duration-300">
        {/* Üst Kalkan İkonu & Başlık */}
        <div className="flex flex-col items-center text-center mb-6 space-y-3">
          <div className="bg-cyan-500/10 border border-cyan-500/40 p-4 rounded-2xl text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] animate-pulse">
            <Shield className="w-10 h-10 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-widest bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              AEGIS C4ISR PORTAL
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Zero-Trust Tactical Air Defense Ingestion & Command Access Gate
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-rose-950/90 border border-rose-600 text-rose-200 text-xs p-3.5 rounded-xl flex items-center space-x-2 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono">
          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1.5 uppercase tracking-wider">
              Kullanıcı Adı (Callsign)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-[#050811] border border-cyan-900/60 focus:border-cyan-400 text-cyan-200 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              placeholder="operator, device veya guest"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cyan-300 mb-1.5 uppercase tracking-wider">
              Erişim Anahtarı / Parola
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#050811] border border-cyan-900/60 focus:border-cyan-400 text-cyan-200 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-98 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 text-sm uppercase tracking-widest cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? "AUTHENTICATING..." : "ENTER COMMAND CENTER"}</span>
            </button>
          </div>
        </form>

        {/* Hızlı Rol Seçimi & Misafir Modu */}
        <div className="mt-6 pt-5 border-t border-slate-800/90 space-y-2 font-mono">
          <div className="text-[10px] text-cyan-400/70 uppercase font-bold text-center tracking-widest mb-2">
            Quick Test Credentials:
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setUsername("operator");
                setPassword("Password123!");
              }}
              className="bg-[#050914] hover:bg-slate-900 border border-emerald-500/40 text-emerald-400 p-2.5 rounded-xl text-left transition flex items-center space-x-2 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
            >
              <Lock className="w-4 h-4 shrink-0 text-emerald-400" />
              <div className="truncate">
                <div className="font-bold text-[11px]">🛡️ Operatör</div>
                <div className="text-[9px] text-slate-400 font-mono">Full Command</div>
              </div>
            </button>

            <button
              type="button"
              onClick={onGuestAccess}
              className="bg-[#050914] hover:bg-slate-900 border border-cyan-500/40 text-cyan-400 p-2.5 rounded-xl text-left transition flex items-center space-x-2 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
            >
              <Eye className="w-4 h-4 shrink-0 text-cyan-400" />
              <div className="truncate">
                <div className="font-bold text-[11px]">👁️ Misafir</div>
                <div className="text-[9px] text-slate-400 font-mono">Read-Only Observer</div>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-5 text-[10px] text-slate-400 text-center flex items-center justify-center space-x-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>256-BIT HMAC-SHA256 JWT ENCRYPTED MIL-SPEC GATEWAY</span>
        </div>
      </div>
    </div>
  );
}
