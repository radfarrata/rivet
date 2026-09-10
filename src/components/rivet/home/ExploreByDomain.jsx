import React from 'react';
import { ChevronRight, Dna, FlaskConical, Atom, Code2, Brain, Shield, Bot, Sigma } from 'lucide-react';

const CARDS = [
  { id: 'biology', label: 'Biology', desc: 'Genetics, bioinformatics', icon: Dna },
  { id: 'chemistry', label: 'Chemistry', desc: 'Reaction prediction', icon: FlaskConical },
  { id: 'physics', label: 'Physics', desc: 'Quantum, classical', icon: Atom },
  { id: 'coding', label: 'Coding', desc: 'Algorithms, systems', icon: Code2 },
  { id: 'reasoning', label: 'Reasoning', desc: 'Multi-step inference', icon: Brain },
  { id: 'mathematics', label: 'Mathematics', desc: 'Proofs, applied math', icon: Sigma },
  { id: 'safety', label: 'Safety', desc: 'Refusals, robustness', icon: Shield },
  { id: 'agentic', label: 'Agentic', desc: 'Tool use, long horizon', icon: Bot },
];

// Restrained, monochrome domain list — one bordered block, hairline-separated rows.
export default function ExploreByDomain({ onNavigate }) {
  return (
    <section className="rounded-2xl border border-[#1f232e] bg-[#12141b] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1f232e] flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#8b90a0]">Explore by domain</h2>
        <button onClick={() => onNavigate?.('capability-map')} className="text-xs font-semibold text-[#b06d97] hover:underline">Leaderboards</button>
      </div>
      <div className="grid grid-cols-2">
        {CARDS.map(({ id, label, desc, icon: Icon }, i) => (
          <button
            key={id}
            onClick={() => onNavigate?.('capability-map')}
            className={`group text-left flex items-center gap-3 px-4 py-3 hover:bg-[#171a23] transition-colors border-[#1f232e] ${i % 2 === 0 ? 'border-r' : ''} ${i < 6 ? 'border-b' : ''}`}
          >
            <span className="w-8 h-8 rounded-lg bg-[#1a1d29] border border-[#2a2e3d] text-[#b8bcc8] group-hover:text-[#b06d97] flex items-center justify-center flex-shrink-0 transition-colors"><Icon size={15} /></span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-white truncate">{label}</span>
              <span className="block text-[11px] text-[#6b7080] truncate">{desc}</span>
            </span>
            <ChevronRight size={14} className="ml-auto text-[#3a3f4d] group-hover:text-[#8b90a0] flex-shrink-0 transition-colors" />
          </button>
        ))}
      </div>
    </section>
  );
}