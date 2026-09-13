import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { integrity } from '@/components/rivet/integrity/client';
import ReportMarkdown from '@/components/rivet/reports/ReportMarkdown';
import ReportActions from '@/components/rivet/reports/ReportActions';
export default function DomainReport() {
  const urlParams=new URLSearchParams(window.location.search),snapshotHash=urlParams.get('snapshot');
  const query=useQuery({queryKey:['domain-report',snapshotHash],queryFn:()=>integrity('reportSnapshot',{snapshotHash}),enabled:!!snapshotHash,retry:false});
  return <div className="dark min-h-screen bg-background text-foreground"><header className="border-b border-border px-4 py-4"><div className="mx-auto max-w-4xl flex justify-between gap-4 items-center"><h1 className="text-sm font-semibold">Rivet / Domain snapshot</h1><Link to="/?nav=evaluation-lab" className="text-xs underline">Back to Evaluation Lab</Link></div></header>
    <main className="mx-auto max-w-4xl p-4 sm:p-8 space-y-6">{!snapshotHash?<p role="alert">No report snapshot was selected.</p>:query.isLoading?<p role="status">Loading and verifying the saved snapshot…</p>:query.isError?<div role="alert" className="rounded-xl border border-border p-5 space-y-3"><h2 className="font-semibold">Report unavailable</h2><p className="text-sm text-muted-foreground">{query.error.message}</p><button onClick={()=>query.refetch()} className="rounded-full border px-4 py-2 text-sm">Retry</button></div>:<>
      <div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full border border-border px-3 py-1">Official evidence only</span><span className="rounded-full border border-border px-3 py-1">Saved snapshot · hash verified</span></div>
      <ReportActions data={query.data}/><section className="rounded-xl border border-border bg-card p-5 sm:p-8"><ReportMarkdown markdown={query.data.manifest.markdown}/></section>
    </>}</main>
  </div>;
}