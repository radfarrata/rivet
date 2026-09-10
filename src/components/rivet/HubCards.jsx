import React from 'react';
import { Hammer, Brain, FlaskConical, ArrowRight } from 'lucide-react';

export default function HubCards({ onNavigate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div onClick={() => onNavigate?.('evaluation-lab')} className="rounded-2xl border border-[#e4e6eb] bg-[#ffffff] p-6 hover:bg-[#f0f2f5] transition-colors cursor-pointer">
        <div className="w-12 h-12 rounded-xl bg-[#653653]/10 flex items-center justify-center mb-4"><FlaskConical className="w-6 h-6 text-[#653653]" /></div>
        <h3 className="text-lg font-bold text-[#050505] mb-1">Evaluation Lab</h3>
        <p className="text-sm text-[#65676b] mb-4">Which AI is best for this job — and why.</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#653653] hover:underline">Run an evaluation <ArrowRight size={14} /></span>
      </div>
      <div onClick={() => onNavigate?.('projects')} className="rounded-2xl border border-[#e4e6eb] bg-[#ffffff] p-6 hover:bg-[#f0f2f5] transition-colors cursor-pointer">
        <div className="w-12 h-12 rounded-xl bg-[#653653]/10 flex items-center justify-center mb-4"><Hammer className="w-6 h-6 text-[#653653]" /></div>
        <h3 className="text-lg font-bold text-[#050505] mb-1">Build Hub</h3>
        <p className="text-sm text-[#65676b] mb-4">Create. Collaborate. Build together.</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#653653] hover:underline">Explore Build Hub <ArrowRight size={14} /></span>
      </div>
      <div onClick={() => onNavigate?.('training-hub')} className="rounded-2xl border border-[#e4e6eb] bg-[#ffffff] p-6 hover:bg-[#f0f2f5] transition-colors cursor-pointer">
        <div className="w-12 h-12 rounded-xl bg-[#653653]/10 flex items-center justify-center mb-4"><Brain className="w-6 h-6 text-[#653653]" /></div>
        <h3 className="text-lg font-bold text-[#050505] mb-1">Training Hub</h3>
        <p className="text-sm text-[#65676b] mb-4">Train AI. Improve the future.</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#653653] hover:underline">Explore Training Hub <ArrowRight size={14} /></span>
      </div>
    </div>
  );
}