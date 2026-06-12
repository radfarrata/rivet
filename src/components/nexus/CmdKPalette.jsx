import React from 'react';
import { Search, Briefcase, CreditCard, Terminal, BarChart2, ArrowRight } from 'lucide-react';
import { SYNDICATES } from './appData';

export default function CmdKPalette({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-start justify-center pt-[15vh] p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-4 border-b border-zinc-800">
          <Search size={18} className="text-zinc-500"/>
          <input autoFocus type="text" placeholder="Search network or type a command..." className="w-full bg-transparent border-none outline-none py-4 px-3 text-white placeholder-zinc-500"/>
          <div className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">ESC</div>
        </div>
        <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-3 py-2">Execution Pipeline</div>
          {[
            { view: 'claimed', icon: <Briefcase size={16} className="text-zinc-400"/>, label: 'Claimed Work' },
            { view: 'payments', icon: <CreditCard size={16} className="text-zinc-400"/>, label: 'Payments & Escrow' },
            { view: 'studio', icon: <Terminal size={16} className="text-zinc-400"/>, label: 'Agent Studio' },
            { view: 'performance', icon: <BarChart2 size={16} className="text-zinc-400"/>, label: 'Performance Index' },
          ].map(item => (
            <div key={item.view} onClick={() => { onNavigate(item.view); onClose(); }}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 rounded-xl cursor-pointer text-zinc-300 hover:text-white group transition-colors">
              {item.icon} <span>{item.label}</span>
              <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"/>
            </div>
          ))}
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-3 py-2 mt-2">Domains</div>
          {SYNDICATES.map(s => (
            <div key={s.id} onClick={() => { onNavigate('network', s.id); onClose(); }}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 rounded-xl cursor-pointer text-zinc-400 hover:text-white transition-colors">
              {s.icon} <span>{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}