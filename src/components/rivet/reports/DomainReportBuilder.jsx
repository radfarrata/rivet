import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, RefreshCw } from 'lucide-react';
import { integrity } from '@/components/rivet/integrity/client';
import { DOMAINS } from '@/components/rivet/evalModels';
import ReportTemplateCards from '@/components/rivet/reports/ReportTemplateCards';
import ReportReadiness from '@/components/rivet/reports/ReportReadiness';
import ReportHistory from '@/components/rivet/reports/ReportHistory';
export default function DomainReportBuilder({ currentUser }) {
  const [domain,setDomain]=useState('biology'),[templateId,setTemplateId]=useState('domain_brief');
  const navigate=useNavigate(),client=useQueryClient();
  const query=useQuery({queryKey:['report-readiness',currentUser?.id,domain],queryFn:()=>integrity('reportReadiness',{domain}),enabled:!!currentUser?.id,refetchInterval:30000});
  const generate=useMutation({mutationFn:()=>integrity('generateReport',{domain,templateId}),onSuccess:data=>{client.invalidateQueries({queryKey:['report-readiness']});navigate(`/report?snapshot=${data.report.snapshotHash}`);}});
  const template=query.data?.templates.find(t=>t.id===templateId);
  return <section className="dark rounded-xl border border-border bg-card text-foreground p-4 sm:p-5 space-y-4">
    <header className="flex items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 font-semibold"><FileText size={18}/> Citable domain reports</h3><p className="text-xs text-muted-foreground mt-1">Official evidence only. Freeze the latest qualifying results and their supporting audit references into a citation-ready snapshot.</p></div><span className="shrink-0 rounded-full border border-border px-2 py-1 text-xs">Report templates</span></header>
    <div className="flex items-end gap-3"><label className="block flex-1 text-xs font-medium">Domain<select disabled={generate.isPending} value={domain} onChange={e=>{setDomain(e.target.value);generate.reset();}} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{DOMAINS.map(d=><option key={d.id} value={d.id}>{d.label}</option>)}</select></label><button type="button" disabled={query.isFetching||generate.isPending} onClick={()=>query.refetch()} className="rounded-lg border border-border p-2 disabled:opacity-50" aria-label="Refresh report eligibility"><RefreshCw size={18}/></button></div>
    {query.isLoading||!currentUser?<p role="status" className="text-sm text-muted-foreground">Checking official evidence and audit references…</p>:query.isError?<p role="alert" className="text-sm text-destructive">{query.error.message} Use refresh to retry.</p>:<>
      <ReportTemplateCards templates={query.data.templates} value={templateId} onChange={setTemplateId} disabled={generate.isPending}/>
      {template&&<details className="text-xs rounded-lg border border-border p-3"><summary className="cursor-pointer font-semibold">Preview report structure</summary><ol className="mt-3 space-y-1 list-decimal pl-4 text-muted-foreground">{template.sections.map(section=><li key={section}>{section}</li>)}</ol><p className="mt-3 text-muted-foreground">Every report includes dated audit references, source evidence, methodological limitations, and a full SHA-256 citation; no sample findings are inserted.</p></details>}
      <ReportReadiness data={query.data}/>
      {generate.isError&&<p role="alert" className="text-sm text-destructive">{generate.error.message}</p>}
      <div className="flex flex-wrap gap-3 items-center"><button type="button" disabled={!query.data.canGenerate||query.isFetching||generate.isPending} onClick={()=>generate.mutate()} className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-40">{generate.isPending?'Verifying evidence and saving…':'Generate official snapshot'}</button><p className="text-xs text-muted-foreground">Existing reports are never replaced by a new generation.</p></div>
      <ReportHistory reports={query.data.reports}/>
    </>}
  </section>;
}