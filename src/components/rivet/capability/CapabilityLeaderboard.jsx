import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { integrity } from '@/components/rivet/integrity/client';
import RankingRows from '@/components/rivet/integrity/RankingRows';
import LeaderboardFilters from '@/components/rivet/capability/LeaderboardFilters';
export default function CapabilityLeaderboard({ rows, domain }) {
  const [status, setStatus] = useState('all'), [report, setReport] = useState('all'), [sort, setSort] = useState('score');
  const reports = useQuery({ queryKey: ['leaderboard-reports', domain], queryFn: () => integrity('reportAvailability', { domain }), refetchInterval: 60000 });
  const reportsReady = reports.isSuccess && !reports.isError;
  const byModel = Object.fromEntries((reports.data?.models || []).map(item => [item.modelId, item.report]));
  const counts = { all: rows.length, verified: 0, exploratory: 0, 'insufficient evidence': 0 };
  rows.forEach(row => { counts[row.label] = (counts[row.label] || 0) + 1; });
  const reportDependent = report !== 'all' || sort === 'reports';
  const waiting = reportDependent && !reportsReady;
  const priority = { verified: 2, exploratory: 1, 'insufficient evidence': 0 };
  const visible = rows.filter(row => (status === 'all' || row.label === status) && (report === 'all' || (report === 'available' ? !!byModel[row.modelId] : !byModel[row.modelId]))).sort((a, b) => {
    const first = sort === 'verification' ? (priority[b.label] || 0) - (priority[a.label] || 0) : sort === 'reports' ? Number(!!byModel[b.modelId]) - Number(!!byModel[a.modelId]) : 0;
    return first || (b.avg ?? -1) - (a.avg ?? -1) || a.modelId.localeCompare(b.modelId);
  });
  const reset = () => { setStatus('all'); setReport('all'); setSort('score'); };
  return <section aria-label="Capability leaderboard" className="space-y-3">
    <LeaderboardFilters {...{ status, setStatus, report, setReport, sort, setSort, counts, reportsReady, reset }} />
    <p className="text-xs text-muted-foreground">Filters change only the leaderboard, not scores, matched cohorts, domain metrics, or trends. Reports are saved snapshots citing this model in this domain—not proof that its current score is verified.</p>
    {reports.isLoading && <p role="status" className="text-xs text-muted-foreground">Checking report availability…</p>}
    {reports.isError && <p role="alert" className="text-xs text-destructive">Report availability could not be checked. <button onClick={() => reports.refetch()} className="underline">Retry</button></p>}
    {!waiting && <>
      <p role="status" className="text-xs text-muted-foreground">Showing {visible.length} of {rows.length} models</p>
      {visible.length ? <RankingRows rows={visible} reportsByModel={byModel} reportsReady={reportsReady} /> : <div className="rounded-xl border border-border bg-card p-6 text-center"><h2 className="font-semibold">No models match these filters</h2><button onClick={reset} className="mt-2 text-sm underline">Reset filters</button></div>}
    </>}
  </section>;
}