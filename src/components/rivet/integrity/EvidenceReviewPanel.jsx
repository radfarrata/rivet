import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { integrity } from '@/components/rivet/integrity/client';
import ContaminationLadder from '@/components/rivet/integrity/ContaminationLadder';
export default function EvidenceReviewPanel({ data, currentUser }) {
  const qc = useQueryClient(); const [mode, setMode] = useState('submitReview'); const [score, setScore] = useState(''); const [notes, setNotes] = useState(''); const [conflict, setConflict] = useState(''); const [clear, setClear] = useState(false);
  const mutation = useMutation({ mutationFn: () => integrity(mode, { resultId: data.result.id, score: Number(score), verdict: Number(score) >= 80 ? 'pass' : Number(score) >= 50 ? 'partial' : 'fail', notes, hasConflict: !clear, conflictDeclaration: conflict }), onSuccess: () => { qc.invalidateQueries(); setNotes(''); } });
  const mine = data.reviews.some(r => r.evaluatorId === currentUser?.id);
  const owner = (data.task.ownerId || data.task.created_by_id) === currentUser?.id;
  const input = 'w-full rounded-lg border border-input bg-background p-2 text-sm';
  return <aside className="space-y-4 min-w-0 bg-card p-4 border-t xl:border-t-0 xl:border-l border-border">
    <h2 className="font-semibold">Review & adjudication</h2>
    <p className="text-xs text-muted-foreground">{data.officialEligible ? 'Publication checks passed.' : 'Not official: complete provenance, an exact provider revision, two verified reviews and a final adjudication are required.'}</p>
    {!!data.publicationBlockers?.length && <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">{data.publicationBlockers.map(reason => <li key={reason}>{reason}</li>)}</ul>}
    <p className="text-xs">{data.version?.contaminationRisk?.replaceAll('_', ' ') || 'Unchecked'}<span className="block text-muted-foreground">{data.version?.contaminationScope || 'Legacy exposure history is unknown.'}</span></p>
    <ContaminationLadder quality={data.quality} />
    {data.finals.length > 0 && <div className="rounded-lg border p-3 text-sm"><strong>Final adjudication: {data.finals[0].finalScore}/100</strong><p className="whitespace-pre-wrap">{data.finals[0].structuredFeedback}</p></div>}
    {data.legacy || owner ? <p className="text-xs text-muted-foreground">{data.legacy ? 'Run a new task version before requesting official expert reviews.' : 'Task authors cannot review their own tasks.'}</p> : <form className="space-y-3" onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
      <p className="text-xs text-muted-foreground">Verified domain credentials required. Reviews here are not blinded and are labelled observational.</p>
      {currentUser?.role === 'admin' && <select aria-label="Review mode" className={input} value={mode} onChange={e => setMode(e.target.value)}><option value="submitReview">Expert review</option><option value="finalAdjudication">Final adjudication</option></select>}
      {mine && mode === 'submitReview' ? <p className="text-sm">Your review is recorded below.</p> : <>
        <input aria-label="Score" type="number" min="0" max="100" step="0.1" required value={score} onChange={e => setScore(e.target.value)} placeholder="Score (0–100)" className={input} />
        <textarea aria-label="Evidence-based feedback" minLength={20} maxLength={8000} required value={notes} onChange={e => setNotes(e.target.value)} placeholder="Explain the decision using rubric criteria and evidence excerpts." className={input} rows={4} />
        <textarea aria-label="Conflict declaration" minLength={10} maxLength={2000} required value={conflict} onChange={e => setConflict(e.target.value)} placeholder="Declare affiliations and confirm why there is no conflict for this task." className={input} />
        <label className="flex gap-2 text-xs"><input type="checkbox" required checked={clear} onChange={e => setClear(e.target.checked)} />I have no conflict of interest on this task.</label>
        <button disabled={mutation.isPending} className="w-full rounded-lg bg-primary text-primary-foreground p-2 text-sm disabled:opacity-50">{mutation.isPending ? 'Saving…' : mode === 'submitReview' ? 'Submit expert review' : 'Record final adjudication'}</button>
      </>}
    </form>}
    {mutation.isError && <p role="alert" className="text-xs text-destructive">{mutation.error?.response?.data?.error || mutation.error.message}</p>}
    {mutation.isSuccess && <p role="status" className="text-xs">Review saved with its audit record.</p>}
  </aside>;
}