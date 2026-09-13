import React from 'react';
import { modelLabel, domainLabel } from '@/components/rivet/evalModels';
import EvidenceLink from '@/components/rivet/integrity/EvidenceLink';
const value = n => n == null ? 'Not available' : n.toFixed(3);
export default function JudgeRankingAgreement({ groups = [] }) {
  return <div className="space-y-3 border-t border-border pt-3">
    <h4 className="text-sm font-semibold">Ranking-level agreement · Kendall’s τ-b</h4>
    {!groups.length && <p className="text-xs text-muted-foreground">Not available — needs adjudicated scores for at least 3 models on at least 2 identical task snapshots.</p>}
    {groups.map((group,index)=><details key={index} className="rounded-lg border border-border p-3"><summary className="cursor-pointer text-sm">{domainLabel(group.domain)} · τ-b {value(group.tauB)} <span className="text-muted-foreground">· {group.modelCount} models · {group.matchedTasks} matched task families</span></summary>
      <p className="text-xs text-muted-foreground mt-2">{group.judge} · {group.methodologyVersion} · {group.matchedTasks<30?'Sparse, exploratory sample.':'Observational comparison.'} All-tied rankings have no defined correlation.</p>
      <div className="overflow-x-auto mt-3"><table className="w-full text-left text-xs"><thead><tr><th scope="col">Model</th><th scope="col" className="p-2">Automated mean</th><th scope="col" className="p-2">Human mean</th></tr></thead><tbody>{group.rows.map(row=><tr key={`${row.modelId}:${row.revision}`} className="border-t border-border"><th scope="row" className="py-2 font-normal">{modelLabel(row.modelId)}<span className="block text-muted-foreground">{row.revision}</span></th><td className="p-2">{value(row.judgeMean)}</td><td className="p-2">{value(row.humanMean)}</td></tr>)}</tbody></table></div>
      <details className="mt-3 text-xs"><summary className="cursor-pointer">Contributing evidence</summary><div className="mt-2 flex flex-wrap gap-3">{group.rows.flatMap(row=>row.resultIds.map(id=><span key={id}>{modelLabel(row.modelId)} · <EvidenceLink resultId={id} /></span>))}</div></details>
    </details>)}
    <p className="text-xs text-muted-foreground">Latest paired result per shared snapshot, one snapshot per task family, equal task weights; the same cohort is used for every model. Judge labels and methodologies are separated, but automatic judge revisions remain unknown. Ranking agreement does not establish accurate individual judgments or official eligibility.</p>
  </div>;
}