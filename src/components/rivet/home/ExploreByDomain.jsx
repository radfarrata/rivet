import React from 'react';
import Icon from '@/components/Icon';

const CARDS = [
  { id: 'biology', label: 'Biology', desc: 'Genetics, bioinformatics, cell biology…', icon: 'dna', color: 'text-[#2fd4a7]' },
  { id: 'chemistry', label: 'Chemistry', desc: 'Organic, inorganic, reaction prediction…', icon: 'flask', color: 'text-[#f5b544]' },
  { id: 'physics', label: 'Physics', desc: 'Quantum, classical, astro physics…', icon: 'atom', color: 'text-[#4f8cff]' },
  { id: 'medicine', label: 'Medicine', desc: 'Diagnostics, treatment, public health…', icon: 'medicine', color: 'text-[#ff6b6b]' },
  { id: 'coding', label: 'Coding', desc: 'Algorithms, systems, debugging…', icon: 'code', color: 'text-[#b06d97]' },
  { id: 'reasoning', label: 'Reasoning', desc: 'Multi-step inference, logic…', icon: 'brain', color: 'text-[#ff7ab6]' },
  { id: 'safety', label: 'Safety', desc: 'Refusals, robustness, alignment…', icon: 'shield-plain', color: 'text-[#e7e9ea]' },
  { id: 'agentic', label: 'Agentic', desc: 'Tool use, long-horizon tasks…', icon: 'bot', color: 'text-[#71767b]' },
];

export default function ExploreByDomain({ onNavigate }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[17px] font-bold text-white">Explore by Domain</h2>
        <button onClick={() => onNavigate?.('capability-map')} className="text-[12px] text-[#b06d97] hover:underline">Leaderboards →</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CARDS.map(({ id, label, desc, icon, color }) => (
          <button
            key={id}
            onClick={() => onNavigate?.('capability-map')}
            className="group text-left bg-[#16181c] border border-[#2f3336] hover:border-[#71767b] rounded-xl p-3.5 transition-colors"
          >
            <div className="flex items-start justify-between">
              <Icon name={icon} size={19} className={color} />
              <Icon name="chevron-right" size={12} className="text-[#71767b] group-hover:text-white transition-colors" />
            </div>
            <p className="text-[13px] font-semibold text-white mt-3">{label}</p>
            <p className="text-[11px] text-[#71767b] mt-0.5 leading-snug line-clamp-2">{desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}