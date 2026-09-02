import React, { useMemo } from 'react';

const WEEKS = 18;

export default function ContributionHeatmap({ posts }) {
  const { grid, total } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - (WEEKS * 7) - today.getDay());
    const g = Array.from({ length: WEEKS }, () => Array(7).fill(0));
    let sum = 0;
    posts.forEach(p => {
      if (!p.created_date) return;
      const d = new Date(p.created_date);
      d.setHours(0, 0, 0, 0);
      const diff = Math.floor((d - start) / 86400000);
      if (diff < 0 || diff >= WEEKS * 7) return;
      const w = Math.floor(diff / 7);
      const day = diff % 7;
      g[w][day] += 1;
      sum += 1;
    });
    return { grid: g, total: sum };
  }, [posts]);

  const max = Math.max(1, ...grid.flat());

  const level = (v) => {
    if (v === 0) return 'bg-white/5';
    const r = v / max;
    if (r < 0.25) return 'bg-[#9d4f7a]/30';
    if (r < 0.5) return 'bg-[#9d4f7a]/50';
    if (r < 0.75) return 'bg-[#9d4f7a]/75';
    return 'bg-[#9d4f7a]';
  };

  return (
    <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#e7e9ea]">Activity</h3>
        <span className="text-xs text-[#71767b]">{total} contributions in the last {WEEKS} weeks</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max pb-1">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((v, di) => (
                <div key={di} title={`${v} contributions`} className={`w-3 h-3 rounded-sm ${level(v)}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-[#71767b]">Less</span>
        <div className="w-3 h-3 rounded-sm bg-white/5" />
        <div className="w-3 h-3 rounded-sm bg-[#9d4f7a]/30" />
        <div className="w-3 h-3 rounded-sm bg-[#9d4f7a]/50" />
        <div className="w-3 h-3 rounded-sm bg-[#9d4f7a]/75" />
        <div className="w-3 h-3 rounded-sm bg-[#9d4f7a]" />
        <span className="text-[10px] text-[#71767b]">More</span>
      </div>
    </div>
  );
}