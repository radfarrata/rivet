import React, { useMemo, useState } from 'react';
import { useModelResults, useEvaluationTasks } from '../useEvaluations';
import { useHumanEvaluations } from '../useHumanEvaluations';
import { DOMAINS, domainLabel, modelLabel } from '../evalModels';
import { aggregateModels, monthlyTrend } from '../evalStats';
import ModelEvidencePanel from '../capability/ModelEvidencePanel';
import ModelTrendChart from '../capability/ModelTrendChart';
import { Map as MapIcon, Trophy, Info, ChevronRight } from 'lucide-react';

const CONF = { High: 'text-[#2fd4a7]', Medium: 'text-[#f5b544]', Low: 'text-[#ff6b6b]' };

export default function CapabilityMapView() {
  const { data: results = [] } = useModelResults();
  const { data: tasks = [] } = useEvaluationTasks();
  const { data: humanEvals = [] } = useHumanEvaluations();
  const [domain, setDomain] = useState('all');
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => aggregateModels(results, humanEvals, tasks, domain), [results, humanEvals, tasks, domain]);
  const trend = useMemo(() => monthlyTrend(domain === 'all' ? results : results.filter(r => r.domain === domain), humanEvals), [results, humanEvals, domain]);
  const activeDomains = useMemo(() => { const s = new Set(results.map(r => r.domain)); return DOMAINS.filter(d => s.has(d.id)); }, [results]);
  const evaluatedCount = tasks.filter(t => t.status === 'evaluated').length;
  const pill = (active) => `px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${active ? 'bg-[#653653] text-white' : 'bg-[#12141b] border border-[#1f232e] text-[#8b90a0] hover:text-white'}`;

  return (
    <div className="space-y-5 max-w-[1000px] mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><MapIcon size={20} className="text-[#b06d97]" /> AI Capability Map</h2>
        <p className="text-sm text-[#8b90a0] mt-0.5">Not "which AI is best" — <span className="text-white font-semibold">which AI is best for this job</span>. Every score is auditable: click a model to see the evidence.</p>
      </div>

      {results.length === 0 ? (
        <div className="bg-[#12141b] rounded-2xl border border-[#1f232e] p-12 text-center text-sm text-[#8b90a0]">The capability map is built only from real evaluation data. Run your first multi-model evaluation in the Evaluation Lab and it fills in here.</div>
      ) : (
        <>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setDomain('all')} className={pill(domain === 'all')}>Overall</button>
            {activeDomains.map(d => <button key={d.id} onClick={() => setDomain(d.id)} className={pill(domain === d.id)}>{d.label}</button>)}
          </div>

          <div className="bg-[#12141b] rounded-2xl border border-[#1f232e] p-5">
            <div className="flex items-center gap-2 text-xs text-[#8b90a0] mb-4">
              <Info size={14} />
              <span>{evaluatedCount} evaluated task{evaluatedCount === 1 ? '' : 's'} • {results.length} model results • {humanEvals.length} human evaluations • {domain === 'all' ? 'all domains' : domainLabel(domain)}</span>
            </div>
            <div className="space-y-2">
              {rows.map((row, i) => (
                <button key={row.modelId} onClick={() => setSelected(row)} className="w-full flex items-center gap-3 md:gap-4 rounded-xl px-2 py-2 hover:bg-[#151823] transition-colors text-left">
                  <div className="flex items-center gap-1.5 w-28 md:w-36 flex-shrink-0">
                    {i === 0 && <Trophy size={14} className="text-[#f5b544]" />}
                    <span className="text-sm font-semibold text-white truncate">{modelLabel(row.modelId)}</span>
                  </div>
                  <div className="flex-1 h-6 bg-[#0e1017] rounded-lg overflow-hidden relative min-w-[60px]">
                    <div className="h-full bg-gradient-to-r from-[#653653] to-[#b06d97] rounded-lg" style={{ width: `${row.avg}%` }} />
                    <span className="absolute inset-y-0 right-2 flex items-center text-xs font-bold text-white">{row.avg.toFixed(1)}</span>
                  </div>
                  <div className="text-[10px] text-right w-24 md:w-32 flex-shrink-0 leading-tight">
                    <p className="text-[#8b90a0]">{row.n} eval{row.n === 1 ? '' : 's'} · {row.humanN} human</p>
                    <p className={`font-semibold ${CONF[row.confidence]}`}>{row.confidence} confidence</p>
                  </div>
                  <ChevronRight size={16} className="text-[#6b7080]" />
                </button>
              ))}
            </div>
          </div>

          <ModelTrendChart data={trend} />
        </>
      )}
      {selected && <ModelEvidencePanel row={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}