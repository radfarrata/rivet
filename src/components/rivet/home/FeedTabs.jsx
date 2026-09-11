import React from 'react';

// X-style sticky tab bar with an underline indicator on the active tab.
export default function FeedTabs({ tabs, active, onChange }) {
  return (
    <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-[#2f3336]">
      <div className="flex">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex-1 relative py-4 text-[15px] transition-colors hover:bg-[#080808] ${active === t.id ? 'text-white font-bold' : 'text-[#71767b] font-medium'}`}
          >
            {t.label}
            {active === t.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-14 rounded-full bg-[#b06d97]" />}
          </button>
        ))}
      </div>
    </div>
  );
}