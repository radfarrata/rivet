import React from 'react';
import { ChevronRight, Dna, FlaskConical, Atom, Code2, Brain, Shield, Bot, Sigma } from 'lucide-react';

const CARDS = [
  { id: 'biology', label: 'Biology', desc: 'Genetics, bioinformatics, cell biology...', icon: Dna, color: 'text-[#2fd4a7]', bg: 'bg-[#2fd4a7]/10' },
  { id: 'chemistry', label: 'Chemistry', desc: 'Organic, inorganic, reaction prediction...', icon: FlaskConical, color: 'text-[#f5b544]', bg: 'bg-[#f5b544]/10' },
  { id: 'physics', label: 'Physics', desc: 'Quantum, classical, astrophysics...', icon: Atom, color: 'text-[#4f8cff]', bg: 'bg-[#4f8cff]/10' },
  { id: 'coding', label: 'Coding', desc: 'Algorithms, debugging, systems design...', icon: Code2, color: 'text-[#8f82ff]', bg: 'bg-[#8f82ff]/10' },
  { id: 'reasoning', label: 'Reasoning', desc: 'Logic, planning, multi-step inference...', icon: Brain, color: 'text-[#ff7ab6]', bg: 'bg-[#ff7ab6]/10' },
  { id: 'mathematics', label: 'Mathematics', desc: 'Proofs, calculus, applied math...', icon: Sigma, color: 'text-[#5ad1ff]', bg: 'bg-[#5ad1ff]/10' },
  { id: 'safety', label: 'Safety', desc: 'Refusals, alignment, robustness...', icon: Shield, color: 'text-[#ff6b6b]', bg: 'bg-[#ff6b6b]/10' },
  { id: 'agentic', label: 'Agentic', desc: 'Tool use, long-horizon tasks...', icon: Bot, color: 'text-[#c084fc]', bg: 'bg-[#c084fc]/10' },
];

export default function ExploreByDomain({ onNavigate }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-white">Explore by Domain</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CARDS.map(({ id, label, desc, icon: Icon, color, bg }) => (
          <button key={id} onClick={() => onNavigate?.('capability-map')} className="text-left bg-[#12141b] border border-[#1f232e] rounded-2xl p-4 hover:border-[#6d5dfc]/40 transition-colors group">
            <div className="flex items-start justify-between">
              <span className={`w-9 h-9 rounded-lg ${bg} ${color} flex items-center justify-center`}><Icon size={18} /></span>
              <ChevronRight size={16} className="text-[#6b7080] group-hover:text-white transition-colors" />
            </div>
            <p className="text-sm font-semibold text-white mt-3">{label}</p>
            <p className="text-[11px] text-[#8b90a0] mt-0.5 line-clamp-2">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}