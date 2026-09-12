import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { integrity } from '@/components/rivet/integrity/client';
export default function TaskWorkspaceSelect({ value, onChange }) {
  const query = useQuery({ queryKey: ['evaluation-workspaces'], queryFn: () => integrity('workspaces') });
  return <div className="space-y-1"><label className="text-xs text-muted-foreground">Private workspace<select aria-label="Private evaluation workspace" value={value || ''} onChange={e => onChange(e.target.value)} className="block w-full rounded-lg bg-background border border-input p-2 text-sm"><option value="">Personal — only you and administrators</option>{(query.data || []).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label><p className="text-xs text-muted-foreground">Create workspaces and manage access in Expert Workspace → Credentials & access.</p>{query.isError && <p role="alert" className="text-xs text-destructive">Could not load shared workspaces. Personal privacy remains available.</p>}</div>;
}