import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { integrity } from '@/components/rivet/integrity/client';
import { DOMAINS } from '@/components/rivet/evalModels';
export default function CredentialApplication({ credential }) {
  const qc = useQueryClient(); const [form, setForm] = useState({ domains: credential?.domains || [], affiliation: credential?.affiliation || '', orcid: credential?.orcid || '', portfolioUrl: credential?.portfolioUrl || '', evidenceNotes: credential?.evidenceNotes || '', conflictDeclaration: credential?.conflictDeclaration || '' });
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const save = useMutation({ mutationFn: () => integrity('applyExpert', form), onSuccess: () => qc.invalidateQueries() });
  const cls = 'w-full rounded-lg border border-input bg-background p-2 text-sm';
  return <form className="space-y-3 rounded-xl border border-border bg-card p-4" onSubmit={e => { e.preventDefault(); save.mutate(); }}>
    <h3 className="font-semibold">Expert credential application</h3>
    <p className="text-xs text-muted-foreground">Status: {credential?.status || 'not submitted'}. Manual verification; ORCID and affiliation are claims until reviewed. Updating an application returns it to pending.</p>
    {credential?.decisionReason && <p className="text-sm">Decision: {credential.decisionReason}</p>}
    <div className="flex flex-wrap gap-2">{DOMAINS.map(d => <label key={d.id} className="flex gap-1 text-xs"><input type="checkbox" checked={form.domains.includes(d.id)} onChange={e => set('domains', e.target.checked ? [...form.domains, d.id] : form.domains.filter(x => x !== d.id))} />{d.label}</label>)}</div>
    <input aria-label="Affiliation" value={form.affiliation} onChange={e => set('affiliation', e.target.value)} placeholder="Affiliation / independent practice" maxLength={200} className={cls} />
    <input aria-label="ORCID" value={form.orcid} onChange={e => set('orcid', e.target.value)} placeholder="ORCID (optional)" className={cls} />
    <input aria-label="Portfolio URL" type="url" value={form.portfolioUrl} onChange={e => set('portfolioUrl', e.target.value)} placeholder="HTTPS portfolio or publication URL" className={cls} />
    <textarea aria-label="Verification evidence" minLength={20} maxLength={4000} required value={form.evidenceNotes} onChange={e => set('evidenceNotes', e.target.value)} placeholder="Describe verifiable expertise, publications, registration or portfolio evidence." className={cls} />
    <textarea aria-label="Professional conflicts" minLength={10} maxLength={2000} required value={form.conflictDeclaration} onChange={e => set('conflictDeclaration', e.target.value)} placeholder="Disclose employers, model-provider relationships and other potential conflicts." className={cls} />
    <button disabled={save.isPending || !form.domains.length} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm disabled:opacity-50">{save.isPending ? 'Submitting…' : 'Submit for manual verification'}</button>
    {save.isError && <p role="alert" className="text-sm text-destructive">{save.error.message}</p>}
    {save.isSuccess && <p role="status" className="text-sm">Application saved. An independent administrator must verify it.</p>}
  </form>;
}