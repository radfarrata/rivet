import React, { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useModelResults, useEvaluationTasks } from '../useEvaluations';
import { useHumanEvaluations } from '../useHumanEvaluations';
import { aggregateModels } from '../evalStats';
import { DOMAINS, modelLabel } from '../evalModels';

export default function LeaderboardCard({ onNavigate }) {
  const { data: results = [] } = useModelResults();
  const { data: tasks = [] } = useEvaluationTasks();
  const { data: humanEvals = [] } = useHumanEvaluations();
  const [domain, setDomain] = useState('all');

  const domains = useMemo(() => { const s = new Set(results.map(r => r.domain)); return DOMAINS.filter(d => s.has(d.id)).slice(0, 3); }, [results]);
  const rows = useMemo(() => aggregateModels(results, humanEvals, tasks, domain).slice(0, 5), [results, humanEvals, tasks, domain]);
  const tabCls = (active) => `px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${active ? 'bg-[#653653] text-white' : 'text-[#71767b] hover:text-white'}`;

  return (
    <div className="bg-[#16181c] border border-[#2f3336] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Trophy size={15} className="text-[#f5b544]" /> Leaderboard</h3>
        <button onClick={() => onNavigate?.('capability-map')} className="text-[11px] text-[#b06d97] hover:underline">See all →</button>
      </div>
      <div className="flex gap-1 bg-black/40 border border-[#2f3336] rounded-xl p-1 mb-3 overflow-x-auto scrollbar-hide">
        <button onClick={() => setDomain('all')} className={tabCls(domain === 'all')}>Overall</button>
        {domains.map(d => <button key={d.id} onClick={() => setDomain(d.id)} className={tabCls(domain === d.id)}>{d.label}</button>)}
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-[#71767b]">Run evaluations to populate the leaderboard.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r, i) => (
            <div key={r.modelId} className="flex items-center gap-3 text-xs">
              <span className="w-4 text-[#71767b]">{i + 1}</span>
              <span className="w-7 h-7 rounded-full bg-[#2f3336] flex items-center justify-center text-[10px] font-bold text-white">{modelLabel(r.modelId).slice(0, 1)}</span>
              <div className="flex-1 min-w-0"><p className="text-white font-medium truncate">{modelLabel(r.modelId)}</p><p className="text-[10px] text-[#71767b]">{r.n} evals · {r.confidence} confidence</p></div>
              <span className="text-white font-semibold">{Math.round(r.avg)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}