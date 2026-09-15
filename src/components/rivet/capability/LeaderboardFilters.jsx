import React from 'react';
export default function LeaderboardFilters({ status, setStatus, report, setReport, sort, setSort, counts, reportsReady, reset }) {
  const field = 'w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground';
  return <div className="space-y-3">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <label className="space-y-1 text-xs text-muted-foreground"><span>Evidence verification</span><select className={field} value={status} onChange={e => setStatus(e.target.value)}>
        <option value="all">All statuses ({counts.all})</option>
        <option value="verified">Verified ({counts.verified})</option>
        <option value="exploratory">Exploratory ({counts.exploratory})</option>
        <option value="insufficient evidence">Insufficient evidence ({counts['insufficient evidence']})</option>
      </select></label>
      <label className="space-y-1 text-xs text-muted-foreground"><span>Domain report</span><select className={field} value={report} disabled={!reportsReady} onChange={e => setReport(e.target.value)}>
        <option value="all">All models</option><option value="available">Report available</option><option value="none">No accessible report</option>
      </select></label>
      <label className="space-y-1 text-xs text-muted-foreground"><span>Sort models</span><select className={field} value={sort} onChange={e => setSort(e.target.value)}>
        <option value="score">Highest score</option><option value="verification">Verified first</option><option value="reports" disabled={!reportsReady}>Reports first</option>
      </select></label>
    </div>
    {(status !== 'all' || report !== 'all' || sort !== 'score') && <button type="button" onClick={reset} className="text-xs text-foreground underline">Reset filters and sort</button>}
  </div>;
}