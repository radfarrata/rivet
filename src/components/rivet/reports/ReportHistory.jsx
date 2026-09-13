import React from 'react';
import { Link } from 'react-router-dom';
export default function ReportHistory({ reports }) {
  return <section className="border-t border-border pt-4"><h4 className="text-sm font-semibold">Saved domain snapshots</h4><p className="text-xs text-muted-foreground mt-1">The 20 most recent snapshots you can access; existing citations always point to their saved contents.</p>
    {!reports.length?<p className="text-xs text-muted-foreground mt-3">No official reports have been generated for this domain.</p>:<div className="mt-3 divide-y divide-border">{reports.map(report=><Link key={report.id} to={`/report?snapshot=${report.snapshotHash}`} className="block py-3 hover:underline"><h5 className="text-sm font-medium">{report.title}</h5><p className="text-xs text-muted-foreground mt-1">{new Date(report.generatedAt).toLocaleString()} · {report.resultCount} results · {report.auditCount} audit references</p><p className="font-mono text-xs text-muted-foreground mt-1">SHA-256 {report.snapshotHash.slice(0,16)}…</p></Link>)}</div>}
  </section>;
}