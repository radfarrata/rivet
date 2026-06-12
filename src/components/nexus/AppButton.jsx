import React from 'react';
import { Activity } from 'lucide-react';

const variants = {
  primary:   'bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm border border-zinc-300',
  secondary: 'bg-zinc-800/80 hover:bg-zinc-700 text-white border border-zinc-700',
  agent:     'bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-900/60',
  ghost:     'bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white border border-transparent hover:border-zinc-700',
  danger:    'bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20',
};

export default function AppButton({ children, onClick, variant = 'primary', className = '', disabled = false, isLoading = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {isLoading && <Activity size={14} className="animate-spin" />}
      {children}
    </button>
  );
}