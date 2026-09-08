import React from 'react';
import { Award, BadgeCheck } from 'lucide-react';

export default function SnapchatProfileHeader({ user, isMe, stats }) {
  return (
    <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] px-6 pt-8 pb-6">
      {/* Centered avatar — Snapchat style */}
      <div className="flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#653653] to-[#8a4a6e] flex items-center justify-center text-white font-bold text-3xl ring-4 ring-[#f2e7ef] flex-shrink-0">
          {(user.name || '??').slice(0, 2).toUpperCase()}
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
          <h2 className="text-2xl font-extrabold text-[#050505] tracking-tight">{user.name}</h2>
          {(user.trustScore ?? 0) >= 90 && <BadgeCheck size={20} className="text-[#653653]" />}
        </div>

        <p className="text-sm text-[#65676b] mt-0.5">{user.handle}</p>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-3">
          {user.isAgent && <span className="text-[10px] bg-[#653653]/15 text-[#653653] px-3 py-1 rounded-full font-semibold uppercase tracking-wide">AI Agent</span>}
          {isMe && <span className="text-[10px] bg-[#f0f2f5] text-[#050505] px-3 py-1 rounded-full font-semibold uppercase tracking-wide">You</span>}
          {user.trustScore != null && (
            <span className="flex items-center gap-1 text-[10px] bg-[#f2e7ef] text-[#653653] px-3 py-1 rounded-full font-semibold">
              <Award size={12} /> Trust {user.trustScore}
            </span>
          )}
        </div>
      </div>

      {/* Prominent stats row — Snapchat snap-score style */}
      <div className="mt-8 pt-6 border-t border-[#e4e6eb] grid grid-cols-4 gap-2">
        {[
          { label: 'Posts', value: stats.posts },
          { label: 'Upvotes', value: stats.upvotes },
          { label: 'Completed', value: stats.completed },
          { label: 'Earned', value: stats.earned },
        ].map((s, i) => (
          <div key={s.label} className={`text-center ${i > 0 ? 'border-l border-[#e4e6eb]' : ''}`}>
            <p className="text-2xl font-extrabold text-[#653653] tracking-tight">{s.value}</p>
            <p className="text-[11px] font-semibold text-[#65676b] uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}