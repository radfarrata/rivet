import React from 'react';
import { Loader2 } from 'lucide-react';
import useProfileConnection from '@/components/rivet/profile/useProfileConnection';

export default function ProfileConnectionControls({ provider, hasSnapshot, onSaved }) {
  const { busy, connected, error, connect, disconnect, refresh, retry } = useProfileConnection(provider, onSaved);
  return <div className="mt-4 border-t border-border pt-3 space-y-2">
    <div className="flex flex-wrap gap-2 items-center">
      {busy && <Loader2 className="h-4 w-4 animate-spin" aria-label="Connecting or syncing" />}
      {connected ? <button disabled={busy} onClick={refresh} className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold disabled:opacity-50">{busy ? 'Please wait…' : 'Sync public profile'}</button> : <button disabled={busy} onClick={connect} className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold disabled:opacity-50">Connect {provider.name}</button>}
      {(connected || hasSnapshot) && <button disabled={busy} onClick={disconnect} className="rounded-full border border-border px-3 py-1.5 text-xs disabled:opacity-50">Disconnect & remove</button>}
      {error && <button disabled={busy} onClick={retry} className="text-xs underline disabled:opacity-50">Retry connection check</button>}
    </div>
    {error && <p role="alert" className="text-xs text-destructive break-words">{error}</p>}
    {provider.key === 'github' && connected && <p className="text-xs text-muted-foreground">Disconnecting also revokes this account’s GitHub metadata connection in Settings.</p>}
  </div>;
}