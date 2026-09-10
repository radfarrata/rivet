import React, { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useModelResults } from '../useEvaluations';
import { DOMAINS, modelLabel } from '../evalModels';

export default function LeaderboardCard({ onNavigate }) {
  const { data: results = [] } = useModelResults();
  const [domain, setDomain] = useState('all');

  const domains = useMemo(() => {
    const set = new Set(results.map(r => r.domain));
    return DOMAINS.filter(d => set.has(d.id)).slice(0, 3);
  }, [results]);

  const rows = useMemo(() => {
    const agg = {};
    results.filter(r => domain === 'all' || r.domain === domain).forEach(r => {
      agg[r.modelId] = agg[r.modelId] || { modelId: r.modelId, total: 0, n: 0 };
      agg[r.modelId].total += r.score || 0; agg[r.modelId].n += 1;
    });
    return Object.values(agg).map(a => ({ ...a, avg: a.total / a.n })).sort((a, b) => b.avg - a.avg).slice(0, 5);
  }, [results, domain]);

  const tabCls = (active) => `px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${active ? 'bg-[#6d5dfc] text-white' : 'text-[#8b90a0] hover:text-white'}`;

  return (
    <div className="bg-[#12141b] border border-[#1f232e] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Trophy size={15} className="text-[#f5b544]" /> Leaderboard</h3>
        <button onClick={() => onNavigate?.('capability-map')} className="text-[11px] text-[#8f82ff] hover:underline">See all →</button>
      </div>
      <div className="flex gap-1 bg-[#0e1017] border border-[#1f232e] rounded-xl p-1 mb-3 overflow-x-auto scrollbar-hide">
        <button onClick={() => setDomain('all')} className={tabCls(domain === 'all')}>Overall</button>
        {domains.map(d => <button key={d.id} onClick={() => setDomain(d.id)} className={tabCls(domain === d.id)}>{d.label}</button>)}
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-[#8b90a0]">Run evaluations to populate the leaderboard.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r, i) => (
            <div key={r.modelId} className="flex items-center gap-3 text-xs">
              <span className="w-4 text-[#6b7080]">{i + 1}</span>
              <span className="w-7 h-7 rounded-full bg-[#1f232e] border border-[#2a2e3d] flex items-center justify-center text-[10px] font-bold text-white">{modelLabel(r.modelId).slice(0, 1)}</span>
              <span className="flex-1 text-white font-medium truncate">{modelLabel(r.modelId)}</span>
              <span className="text-white font-semibold">{Math.round(r.avg)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}