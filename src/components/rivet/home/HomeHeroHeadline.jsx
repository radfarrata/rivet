import React from 'react';
import { RivetMark } from '../RivetLogo';

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
        <RivetMark size={60} rounded="rounded-2xl" glow className="relative" />
      </div>
    </div>
  );
}