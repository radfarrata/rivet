import React from 'react';
import { ShieldCheck, LockKeyhole } from 'lucide-react';
export default function ReportReadiness({ data }) {
  return <div className="space-y-3 rounded-lg border border-border bg-background p-4">
    <div className="flex items-center gap-2 text-sm font-semibold">{data.canGenerate?<ShieldCheck size={16}/>:<LockKeyhole size={16}/>} {data.canGenerate?'Official evidence ready for verification':'Generation locked — official evidence required'}</div>
    <div className="grid grid-cols-3 gap-2 text-xs">{[['Considered',data.totalResults],['Eligible',data.eligibleResults],['Matched results',data.citedResults]].map(([label,n])=><p key={label} className="text-muted-foreground">{label}<strong className="block text-xl text-foreground mt-1">{n}</strong></p>)}</div>
    {!data.totalResults&&<p className="text-xs text-muted-foreground">No public evaluation results exist in this domain yet.</p>}
    {!!Object.keys(data.exclusions).length&&<ul className="space-y-1 text-xs text-muted-foreground">{Object.entries(data.exclusions).map(([reason,count])=><li key={reason} className="flex justify-between gap-3"><span>{reason}</span><span className="tabular-nums">{count}</span></li>)}</ul>}
    <p className="text-xs text-muted-foreground">Counts may overlap. The current model integration supplies aliases, not the exact provider revisions required for official reports.</p>
    <p className="text-xs text-muted-foreground">{data.note}</p>
  </div>;
}