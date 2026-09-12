import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { integrity } from '@/components/rivet/integrity/client';
import CredentialApplication from '@/components/rivet/integrity/CredentialApplication';
import CredentialDecision from '@/components/rivet/integrity/CredentialDecision';
import WorkspaceManager from '@/components/rivet/integrity/WorkspaceManager';
import EvidenceLink from '@/components/rivet/integrity/EvidenceLink';
import ReputationBadge from '@/components/rivet/ReputationBadge';
export default function ExpertIntegrityPanel() {
  const q = useQuery({ queryKey: ['integrity-experts'], queryFn: () => integrity('experts') });
  if (q.isLoading) return <p role="status" className="p-4">Loading credentials and review history…</p>;
  if (q.isError) return <div role="alert" className="p-4"><p>Unable to load your expert profile.</p><button onClick={() => q.refetch()} className="underline">Retry</button></div>;
  const mine = q.data.credentials.find(c => c.userId === q.data.userId);
  return <div className="space-y-4">
    <div className="rounded-xl border bg-card p-4"><ReputationBadge expert={{ status: mine?.status || 'unverified', reviews: q.data.verifiedReviewCount }} /><p className="text-xs text-muted-foreground mt-2">{q.data.reviewCount} recorded reviews · weight 1.0 for all verified reviewers. No reliability score is invented from credentials or volume.</p></div>
    <CredentialApplication key={mine?.updated_date || 'new'} credential={mine} />
    {q.data.isAdmin && <section className="space-y-3"><h2 className="font-semibold">Administrator verification queue</h2>{q.data.credentials.filter(c => c.userId !== q.data.userId).length ? q.data.credentials.filter(c => c.userId !== q.data.userId).map(c => <CredentialDecision key={c.id} credential={c} />) : <p className="text-sm text-muted-foreground">No other expert applications. Administrators cannot verify their own credentials.</p>}</section>}
    <WorkspaceManager userId={q.data.userId} isAdmin={q.data.isAdmin} />
    <section className="rounded-xl border bg-card p-4 space-y-2"><h2 className="font-semibold">Your review history</h2>{q.data.history.length ? q.data.history.map(h => <div key={h.id} className="flex flex-wrap gap-2 justify-between text-xs border-t pt-2"><span>{h.score}/100 · {h.verdict} · {h.verification} · {new Date(h.created_date).toLocaleDateString()}</span><EvidenceLink resultId={h.resultId} legacy={h.verification === 'legacy'} /></div>) : <p className="text-sm text-muted-foreground">No reviews yet. Open a captured result in Evaluation evidence to review it.</p>}</section>
  </div>;
}