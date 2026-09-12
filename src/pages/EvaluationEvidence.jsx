import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { integrity } from '@/components/rivet/integrity/client';
import evidenceTrace from '@/components/rivet/integrity/evidenceTrace';
import TraceOutline from '@/components/expert/TraceOutline';
import StepDetail from '@/components/expert/StepDetail';
import EvidenceReviewPanel from '@/components/rivet/integrity/EvidenceReviewPanel';
import { findStepById } from '@/components/expert/useTraces';
export default function EvaluationEvidence() {
  const id = new URLSearchParams(window.location.search).get('result'); const [selected, setSelected] = useState('prompt');
  const query = useQuery({ queryKey: ['evaluation-evidence', id], queryFn: () => integrity('evidence', { resultId: id }), enabled: !!id, retry: false });
  const user = useQuery({ queryKey: ['integrity-current-user'], queryFn: () => base44.auth.me() });
  const trace = query.data ? evidenceTrace(query.data) : null;
  return <div className="dark min-h-screen bg-background text-foreground">
    <header className="border-b border-border p-4 flex flex-wrap gap-3 items-center justify-between"><div><h1 className="text-lg font-bold">Evaluation evidence</h1><p className="text-xs text-muted-foreground">{query.data?.legacy ? 'Legacy / incomplete provenance — excluded from rankings' : query.data ? `${query.data.result.methodologyVersion} · ${query.data.result.score}/100 · one task, not a domain ranking` : 'Versioned tasks, captured outputs and auditable reviews'}</p></div><Link to="/?nav=evaluation-lab" className="text-sm underline">Back to Evaluation Lab</Link></header>
    {!id ? <p role="alert" className="p-6">No result was selected.</p> : query.isLoading ? <p role="status" className="p-6">Loading authorized evidence…</p> : query.isError ? <div role="alert" className="p-6 space-y-3"><p>Evidence is unavailable, incomplete, or you do not have permission to access it.</p><button onClick={() => query.refetch()} className="rounded-lg border px-3 py-2">Retry</button></div> : <div className="grid xl:grid-cols-[16rem_minmax(0,1fr)_20rem] min-h-[80vh]">
      <TraceOutline responsive trace={trace} selectedStepId={selected} onSelectStep={setSelected} />
      <StepDetail trace={trace} step={findStepById(trace.steps, selected)} />
      <EvidenceReviewPanel data={query.data} currentUser={user.data} />
    </div>}
  </div>;
}