import React from 'react';
import { useModelResults } from '@/components/rivet/useEvaluations';
import EvidenceLink from '@/components/rivet/integrity/EvidenceLink';
export default function EvaluationReviewQueue() {
  const q = useModelResults();
  if (q.isLoading) return <p role="status">Loading accessible evaluation evidence…</p>;
  if (q.isError) return <div role="alert"><p>Could not load evaluation evidence.</p><button className="underline" onClick={() => q.refetch()}>Retry</button></div>;
  return <div className="space-y-3"><p className="text-sm text-muted-foreground">Only public evaluations and private workspaces you can access appear here. Credential verification and conflict checks apply when submitting reviews.</p>{q.data.length ? q.data.map(r => <div key={r.id} className="rounded-xl bg-card border p-4 flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold text-sm">{r.taskTitle}</h3><p className="text-xs text-muted-foreground">{r.model} · {r.score}/100 · {r.evidenceStatus === 'legacy' ? 'Legacy / incomplete provenance' : `${r.methodologyVersion} · ${r.evidenceStatus}`} · {r.contaminationRisk.replaceAll('_', ' ')}</p></div><EvidenceLink resultId={r.id} legacy={r.evidenceStatus === 'legacy'} /></div>) : <p className="rounded-xl border p-8 text-center text-sm">Run a new evaluation to start the evidence review queue.</p>}</div>;
}