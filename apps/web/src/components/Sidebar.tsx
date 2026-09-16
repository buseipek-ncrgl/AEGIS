"use client";

import { useState } from "react";
import { Shield, Map, Activity, Bot, FileText, Settings, Radio } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Komuta", icon: Shield },
    { id: "map", label: "Harita", icon: Map },
    { id: "fleet", label: "Filo", icon: Activity },
    { id: "ai", label: "Yapay Zeka", icon: Bot },
    { id: "reports", label: "Raporlar", icon: FileText },
  ];

  return (
    <aside className="w-16 sm:w-20 c4isr-glass-header border-r border-cyan-500/30 flex flex-col items-center py-6 gap-6 z-50 shrink-0 font-mono sticky top-0 h-screen">
      {/* Brand Icon */}
      <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/40 rounded-2xl text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse">
        <Radio className="w-6 h-6 text-cyan-400" />
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-3 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all cursor-pointer group ${
                isActive
                  ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] font-black"
                  : "text-slate-400 hover:text-cyan-300 hover:bg-slate-900/80 border border-transparent hover:border-cyan-500/30"
              }`}
              title={item.label}
            >
              <Icon className={`w-5 h-5 ${isActive ? "animate-pulse" : "group-hover:scale-110"} transition-transform`} />
              <span className="text-[9px] font-bold mt-1 tracking-wider uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-2">
        <button
          className="p-2.5 text-slate-500 hover:text-cyan-400 rounded-xl hover:bg-slate-900 border border-transparent hover:border-cyan-500/30 transition cursor-pointer"
          title="Ayarlar"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
