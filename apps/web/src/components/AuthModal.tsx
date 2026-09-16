"use client";

import { useState } from "react";
import { Lock, KeyRound, ShieldCheck, X, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, username: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [username, setUsername] = useState<string>("admin");
  const [password, setPassword] = useState<string>("operator123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

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
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Giriş başarısız. Kullanıcı adı veya şifre hatalı.");
      }

      const data = await res.json();
      localStorage.setItem("aegis_jwt_token", data.token);
      localStorage.setItem("aegis_operator_user", username);
      onLoginSuccess(data.token, username);
      onClose();
    } catch (err: any) {
      setError(err.message || "Giriş yapılırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-slate-100 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-xl text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Operatör Yetkilendirmesi (JWT)</h2>
            <p className="text-xs text-slate-400">AEGIS Enterprise Güvenlik Protokolü</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kullanıcı Adı</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                placeholder="Örn: admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Şifre</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? "Doğrulanıyor..." : "Giriş Yap ve Token Al"}</span>
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>HMAC-SHA256 İmzalı JWT Bearer Yetkilendirme</span>
        </div>
      </div>
    </div>
  );
}
