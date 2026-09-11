import React from 'react';
import { Sparkles } from 'lucide-react';

export default function HomeHeroHeadline() {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold tracking-tight text-white leading-[1.15]">
          Better answers through<br /><span className="text-[#b06d97]">real evaluation.</span>
        </h1>
        <p className="text-[13px] text-[#71767b] mt-3 leading-relaxed">
          Rivet lets you bring real-world tasks, test multiple AI models, and see how they perform — with transparent, human-verified evaluation.
        </p>
      </div>
      <div className="hidden sm:flex w-32 h-32 flex-shrink-0 items-center justify-center relative">
        <div className="absolute inset-0 rounded-full bg-[#653653]/25 blur-2xl" />
        <div className="absolute inset-2 rounded-full border border-[#653653]/30" />
        <div className="absolute inset-6 rounded-full border border-[#653653]/20 rotate-45 scale-x-125" />
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#b06d97] to-[#4a2740] flex items-center justify-center shadow-[0_0_36px_rgba(101,54,83,0.7)] relative">
          <Sparkles size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}