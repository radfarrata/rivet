import React from 'react';
import { Activity } from 'lucide-react';

export default function GlassButton({ children, variant = 'primary', className = '', isLoading = false, ...props }) {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg text-sm backdrop-blur-md border outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-purple-600/20 text-purple-300 border-purple-500/30 hover:bg-purple-600/40 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] focus:ring-2 focus:ring-purple-500/50",
    secondary: "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20",
    agent: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]",
    ghost: "bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-white/5",
    depin: "bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] border-orange-500/50"
  };

  return (
    <button
      className={`${base} ${variants[variant]} px-4 py-2 ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Activity size={16} className="animate-spin" /> : children}
    </button>
  );
}