import React from 'react';
import EvidenceLink from '@/components/rivet/integrity/EvidenceLink';
import { modelLabel } from '@/components/rivet/evalModels';
export default function RankingRows({ rows }) {
  return <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">{rows.map(row => <section key={row.modelId} className="bg-card p-4 space-y-2">
    <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{modelLabel(row.modelId)}</h3><p className="text-xs text-muted-foreground">Alias: {row.modelAlias} · {row.modelRevision || 'exact revision unavailable'} · {row.aliasStatus}</p></div><strong>{row.avg == null ? '—' : `${row.avg.toFixed(1)}/100`}</strong></div>
    <p className="text-xs text-muted-foreground">95% CI: {row.ci ? `${row.ci[0].toFixed(1)}–${row.ci[1].toFixed(1)}` : 'unavailable (fewer than 2 families)'} · {row.n} matched independent-prompt families · {row.runCount} runs · {Math.round(row.coverage * 100)}% cohort coverage</p>
    <p className="text-xs"><span className="rounded-full bg-secondary px-2 py-1 capitalize">{row.label}</span> <span className="text-muted-foreground">{row.methodologyVersion}</span></p>
    <details className="text-xs"><summary className="cursor-pointer">Evidence for every contributing score ({row.history.length})</summary><div className="mt-2 space-y-2">{row.history.length ? row.history.map(item => <div key={item.id} className="flex flex-wrap justify-between gap-2 border-t border-border pt-2"><span>{item.taskTitle} · {item.score}/100</span><EvidenceLink resultId={item.id} /></div>) : <p>No task families shared by all selected models.</p>}</div></details>
  </section>)}</div>;
}