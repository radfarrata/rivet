import React, { useMemo, useState } from 'react';
import { useModelResults, useEvaluationTasks } from '../useEvaluations';
import { DOMAINS, domainLabel, RIVET_MODELS } from '../evalModels';
import { Map as MapIcon, Trophy, Info } from 'lucide-react';

function scoreColor(score) {
  if (score >= 90) return 'bg-[#31a24c]';
  if (score >= 75) return 'bg-[#653653]';
  return 'bg-amber-500';
}

export default function CapabilityMapView() {
  const { data: results = [] } = useModelResults();
  const { data: tasks = [] } = useEvaluationTasks();
  const [domain, setDomain] = useState('all');

  const aggregate = useMemo(() => {
    const rows = {};
    const relevant = domain === 'all' ? results : results.filter(r => r.domain === domain);
    relevant.forEach(r => {
      const key = r.modelId;
      rows[key] = rows[key] || { modelId: key, model: r.model, total: 0, n: 0 };
      rows[key].total += r.score || 0;
      rows[key].n += 1;
    });
    return Object.values(rows)
      .map(r => ({ ...r, avg: r.n ? r.total / r.n : 0 }))
      .sort((a, b) => b.avg - a.avg);
  }, [results, domain]);

  const activeDomains = useMemo(() => {
    const set = new Set(results.map(r => r.domain));
    return DOMAINS.filter(d => set.has(d.id));
  }, [results]);

  const evaluatedCount = tasks.filter(t => t.status === 'evaluated').length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#050505] flex items-center gap-2"><MapIcon size={20} className="text-[#653653]" /> AI Capability Map</h2>
        <p className="text-sm text-[#65676b] mt-0.5">Not "which AI is best" — <span className="font-semibold text-[#050505]">which AI is best for this job</span>. Every score is backed by real evaluations.</p>
      </div>

      {results.length === 0 ? (
        <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-12 text-center">
          <p className="text-[#65676b] text-sm">The capability map is built from real evaluation data. Run your first multi-model evaluation in the Evaluation Lab and the map fills in here.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setDomain('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${domain === 'all' ? 'bg-[#653653] text-white' : 'bg-[#ffffff] border border-[#e4e6eb] text-[#65676b] hover:text-[#653653]'}`}>Overall</button>
            {activeDomains.map(d => (
              <button key={d.id} onClick={() => setDomain(d.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${domain === d.id ? 'bg-[#653653] text-white' : 'bg-[#ffffff] border border-[#e4e6eb] text-[#65676b] hover:text-[#653653]'}`}>{d.label}</button>
            ))}
          </div>

          <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-5">
            <div className="flex items-center gap-2 text-xs text-[#65676b] mb-4">
              <Info size={14} />
              <span>{evaluatedCount} evaluated {evaluatedCount === 1 ? 'task' : 'tasks'} • {results.length} model results • {domain === 'all' ? 'all domains' : domainLabel(domain)}</span>
            </div>
            <div className="space-y-4">
              {aggregate.map((row, i) => (
                <div key={row.modelId} className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 w-36 flex-shrink-0">
                    {i === 0 && <Trophy size={15} className="text-[#653653]" />}
                    <span className="text-sm font-semibold text-[#050505] truncate">{RIVET_MODELS.find(m => m.id === row.modelId)?.label || row.model}</span>
                  </div>
                  <div className="flex-1 h-6 bg-[#f0f2f5] rounded-lg overflow-hidden relative min-w-[80px]">
                    <div className={`h-full ${scoreColor(row.avg)} rounded-lg transition-all`} style={{ width: `${row.avg}%` }} />
                    <span className="absolute inset-y-0 right-2 flex items-center text-xs font-bold text-[#050505]">{row.avg.toFixed(1)}</span>
                  </div>
                  <span className="text-[11px] text-[#65676b] w-28 text-right flex-shrink-0">{row.n} evaluation{row.n === 1 ? '' : 's'}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}