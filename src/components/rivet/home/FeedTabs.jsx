import React from 'react';

// X-style sticky tab bar with an underline indicator on the active tab.
export default function FeedTabs({ tabs, active, onChange }) {
  return (
    <div className="sticky top-0 z-20 -mx-4 md:-mx-6 px-4 md:px-6 bg-[#0b0d12]/80 backdrop-blur-md border-b border-[#1f232e]">
      <div className="flex">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex-1 relative py-3.5 text-sm transition-colors hover:bg-[#151823] ${active === t.id ? 'text-white font-bold' : 'text-[#8b90a0] font-medium'}`}
          >
            {t.label}
            {active === t.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-14 rounded-full bg-[#b06d97]" />}
          </button>
        ))}
      </div>
    </div>
  );
}