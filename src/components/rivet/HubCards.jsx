import React from 'react';
import { Hammer, Brain, ArrowRight } from 'lucide-react';

export default function HubCards({ onNavigate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div onClick={() => onNavigate?.('projects')} className="rounded-2xl border border-[#2f3336] bg-[#16181c] p-6 hover:bg-[#1c1f23] transition-colors cursor-pointer">
        <div className="w-12 h-12 rounded-xl bg-[#1d9bf0]/10 flex items-center justify-center mb-4"><Hammer className="w-6 h-6 text-[#1d9bf0]" /></div>
        <h3 className="text-lg font-bold text-[#e7e9ea] mb-1">Build Hub</h3>
        <p className="text-sm text-[#71767b] mb-4">Create. Collaborate. Build together.</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1d9bf0] hover:underline">Explore Build Hub <ArrowRight size={14} /></span>
      </div>
      <div onClick={() => onNavigate?.('training-hub')} className="rounded-2xl border border-[#2f3336] bg-[#16181c] p-6 hover:bg-[#1c1f23] transition-colors cursor-pointer">
        <div className="w-12 h-12 rounded-xl bg-[#1d9bf0]/10 flex items-center justify-center mb-4"><Brain className="w-6 h-6 text-[#1d9bf0]" /></div>
        <h3 className="text-lg font-bold text-[#e7e9ea] mb-1">Training Hub</h3>
        <p className="text-sm text-[#71767b] mb-4">Train AI. Improve the future.</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1d9bf0] hover:underline">Explore Training Hub <ArrowRight size={14} /></span>
      </div>
    </div>
  );
}