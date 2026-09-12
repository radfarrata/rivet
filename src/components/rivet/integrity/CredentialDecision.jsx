import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { integrity } from '@/components/rivet/integrity/client';
export default function CredentialDecision({ credential }) {
  const qc = useQueryClient(); const [reason, setReason] = useState(''); const [status, setStatus] = useState('verified');
  const save = useMutation({ mutationFn: () => integrity('verifyExpert', { credentialId: credential.id, status, reason }), onSuccess: () => qc.invalidateQueries() });
  return <form onSubmit={e => { e.preventDefault(); save.mutate(); }} className="rounded-xl border border-border p-4 space-y-2 bg-card">
    <h3 className="font-semibold">{credential.displayName} · {credential.status}</h3>
    <p className="text-xs">{credential.domains.join(', ')} · {credential.affiliation}</p>
    <p className="text-xs">ORCID: {credential.orcid || 'Not supplied'}</p>
    {credential.portfolioUrl?.startsWith('https://') && <a className="text-xs underline" href={credential.portfolioUrl} target="_blank" rel="noreferrer">Review portfolio</a>}
    <p className="text-sm whitespace-pre-wrap">{credential.evidenceNotes}</p><p className="text-xs">Conflicts: {credential.conflictDeclaration}</p>
    <select aria-label="Verification decision" value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border bg-background p-2 text-sm"><option value="verified">Verify</option><option value="rejected">Reject</option><option value="revoked">Revoke</option></select>
    <textarea aria-label="Verification decision reason" minLength={10} required value={reason} onChange={e => setReason(e.target.value)} placeholder="Record the independent checks performed and decision rationale." className="w-full rounded-lg border bg-background p-2 text-sm" />
    <button disabled={save.isPending} className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm">{save.isPending ? 'Saving…' : 'Record decision'}</button>
    {save.isError && <p role="alert" className="text-xs text-destructive">{save.error.message}</p>}
  </form>;
}