import React from 'react';
import { Check, Github, Loader2, RefreshCw, Unplug } from 'lucide-react';
import useGitHubMetadata from '@/components/rivet/settings/useGitHubMetadata';

export default function GitHubMetadataSettings({ currentUser }) {
  const enabled = currentUser?.role === 'admin';
  const { loading, connected, data, error, connect, disconnect, refresh } = useGitHubMetadata(enabled);
  if (!enabled) return null;
  return <div className="rounded-2xl border border-[#1f232e] bg-[#12141b] p-5 space-y-3">
    <div className="flex items-start gap-3"><Github size={18} className="mt-0.5 text-[#b06d97]" /><div><h2 className="text-sm font-bold text-white">Canonical GitHub metadata</h2><p className="text-xs text-[#8b90a0] mt-1">Refresh repository provenance for linked model versions. Scores and verification status are never changed.</p></div></div>
    {loading && !data ? <p className="text-xs text-[#8b90a0] flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Checking your GitHub connection…</p> : connected ? <>
      <p className="text-xs text-[#8b90a0] flex items-center gap-2"><Check size={13} className="text-[#2fd4a7]" /> Connected as @{data?.login} · {data?.linked ?? data?.updatedVersions ?? 0} linked model versions{data?.latestSync ? ` · Last refreshed ${new Date(data.latestSync).toLocaleString()}` : ''}</p>
      {data?.updatedRepositories != null && <p className="text-xs text-[#8b90a0]">Updated {data.updatedRepositories} repositories across {data.updatedVersions} versions; {data.skippedWithoutCanonicalGitHubUrl} skipped without a canonical GitHub URL.</p>}
      <div className="flex flex-wrap gap-3"><button onClick={refresh} disabled={loading} className="flex items-center gap-2 rounded-full bg-[#653653] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Refresh metadata</button><button onClick={disconnect} className="flex items-center gap-2 text-xs font-semibold text-[#8b90a0] hover:text-white"><Unplug size={13} /> Disconnect</button></div>
    </> : <button onClick={connect} className="flex items-center gap-2 rounded-full bg-[#653653] px-4 py-2 text-xs font-bold text-white"><Github size={13} /> Connect GitHub</button>}
    {error && <p role="alert" className="text-xs text-[#ff6b6b]">{error}</p>}
  </div>;
}