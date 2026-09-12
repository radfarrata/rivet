import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { integrity } from '@/components/rivet/integrity/client';
import { DOMAINS } from '@/components/rivet/evalModels';
import RankingRows from '@/components/rivet/integrity/RankingRows';
import IntegrityMetrics from '@/components/rivet/integrity/IntegrityMetrics';
import ModelTrendChart from '@/components/rivet/capability/ModelTrendChart';
export default function CapabilityEvidenceMap() {
  const [domain, setDomain] = useState('biology'); const [official, setOfficial] = useState(false);
  const q = useQuery({ queryKey: ['integrity-rankings', domain, official], queryFn: () => integrity('rankings', { domain, official }), refetchInterval: 30000 });
  const buckets = {};
  (q.data?.rows || []).forEach(r => r.history.forEach(h => { const month = h.created_date.slice(0, 7); buckets[month] ||= {}; buckets[month][r.modelId] ||= []; buckets[month][r.modelId].push(h.score); }));
  const trend = Object.keys(buckets).sort().map(month => ({ month, ...Object.fromEntries(Object.entries(buckets[month]).map(([model, values]) => [model, values.reduce((a, b) => a + b, 0) / values.length])) }));
  return <div className="dark text-foreground max-w-5xl mx-auto space-y-4">
    <div><h1 className="text-xl font-bold">AI Capability Map</h1><p className="text-sm text-muted-foreground">Domain evidence, not a universal intelligence score. Private evaluations never contribute to this public comparison.</p></div>
    <div className="flex flex-wrap gap-2"><select aria-label="Capability domain" className="rounded-full border bg-card px-3 py-2 text-sm" value={domain} onChange={e => setDomain(e.target.value)}>{DOMAINS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}</select><button onClick={() => setOfficial(false)} className={`rounded-full border px-3 py-2 text-sm ${!official ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>Exploratory evidence</button><button onClick={() => setOfficial(true)} className={`rounded-full border px-3 py-2 text-sm ${official ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>Official rankings</button></div>
    {q.isLoading ? <p role="status">Calculating evidence-backed statistics…</p> : q.isError ? <div role="alert"><p>Could not load rankings. No partial rankings are shown.</p><button onClick={() => q.refetch()} className="underline">Retry</button></div> : <>
      <p className="text-xs text-muted-foreground">Snapshot {q.data.snapshotId} · {q.data.methodologyVersion} · {q.data.excludedLegacy} legacy/incomplete results excluded · {q.data.blockedOfficial} results not eligible for official publication</p>
      {q.data.rows.length ? <RankingRows rows={q.data.rows} /> : <div className="rounded-xl border bg-card p-8 text-center"><h2 className="font-semibold">{official ? 'No publication-eligible results yet' : 'No complete evidence in this domain yet'}</h2><p className="mt-2 text-sm text-muted-foreground">{official ? 'The current model integration reports aliases, not exact provider revisions. Results stay exploratory; missing reviews or evidence also block publication.' : 'Run a new evaluation in the Lab. Existing records are preserved as legacy evidence.'}</p></div>}
      <IntegrityMetrics metrics={q.data.metrics} />
      <details className="rounded-xl border bg-card p-4 text-sm"><summary className="cursor-pointer font-semibold">Methodology and limitations</summary><p className="mt-2 text-muted-foreground">{q.data.methodology}</p><p className="mt-2 text-xs">Computed {new Date(q.data.computedAt).toLocaleString()}. The snapshot ID is a reproducible digest of this view’s contributing result IDs; recomputation time is shown separately. CI values describe this sample, not all real-world tasks.</p></details>
      <ModelTrendChart data={trend} />
    </>}
  </div>;
}