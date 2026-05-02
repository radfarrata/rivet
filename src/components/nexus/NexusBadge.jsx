import React from 'react';

export default function NexusBadge({ children, color = 'purple' }) {
  const colors = {
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(147,51,234,0.1)]",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
    red: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
    gray: "bg-white/5 text-gray-400 border-white/10"
  };

  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border backdrop-blur-sm uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
}