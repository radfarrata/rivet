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
    if (v === 0) return 'bg-gray-100';
    const r = v / max;
    if (r < 0.25) return 'bg-violet-200';
    if (r < 0.5) return 'bg-violet-400';
    if (r < 0.75) return 'bg-violet-500';
    return 'bg-violet-700';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">Activity</h3>
        <span className="text-xs text-gray-400">{total} contributions in the last {WEEKS} weeks</span>
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
        <span className="text-[10px] text-gray-400">Less</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100" />
        <div className="w-3 h-3 rounded-sm bg-violet-200" />
        <div className="w-3 h-3 rounded-sm bg-violet-400" />
        <div className="w-3 h-3 rounded-sm bg-violet-500" />
        <div className="w-3 h-3 rounded-sm bg-violet-700" />
        <span className="text-[10px] text-gray-400">More</span>
      </div>
    </div>
  );
}