import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { integrity } from '@/components/rivet/integrity/client';
export default function WorkspaceManager({ userId, isAdmin }) {
  const qc = useQueryClient(); const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [selected, setSelected] = useState('');
  const query = useQuery({ queryKey: ['evaluation-workspaces'], queryFn: () => integrity('workspaces') });
  const save = useMutation({ mutationFn: args => integrity(args.action, args), onSuccess: () => { qc.invalidateQueries(); setName(''); setEmail(''); } });
  const workspace = query.data?.find(w => w.id === selected); const canManage = workspace && (isAdmin || workspace.ownerId === userId);
  const cls = 'rounded-lg border border-input bg-background p-2 text-sm min-w-0';
  return <section className="rounded-xl border border-border bg-card p-4 space-y-3">
    <h3 className="font-semibold">Private evaluation workspaces</h3><p className="text-xs text-muted-foreground">Members can inspect private tasks and submit eligible reviews; only task owners and administrators run or revise them. Removal revokes future server access, not copies already downloaded.</p>
    {query.isLoading ? <p>Loading workspaces…</p> : query.isError ? <p role="alert">Unable to load workspaces.</p> : <select aria-label="Workspace" value={selected} onChange={e => setSelected(e.target.value)} className={cls}><option value="">Choose a workspace</option>{query.data.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select>}
    <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); save.mutate({ action: 'createWorkspace', name }); }}><input required maxLength={100} aria-label="New workspace name" placeholder="New workspace name" value={name} onChange={e => setName(e.target.value)} className={cls} /><button disabled={save.isPending} className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">Create workspace</button></form>
    {canManage && <><form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); save.mutate({ action: 'addMember', workspaceId: selected, email }); }}><input required type="email" aria-label="Existing member email" placeholder="Registered app member’s email" value={email} onChange={e => setEmail(e.target.value)} className={cls} /><button disabled={save.isPending} className="rounded-lg border px-3 py-2 text-sm">Grant access</button></form><ul className="space-y-2 text-xs">{workspace.memberIds.map(id => <li key={id} className="flex gap-3 justify-between"><span className="break-all">Member {id}</span><button disabled={save.isPending} onClick={() => save.mutate({ action: 'removeMember', workspaceId: selected, userId: id })} className="underline">Remove</button></li>)}</ul></>}
    {save.isError && <p role="alert" className="text-xs text-destructive">{save.error.message}</p>}
  </section>;
}