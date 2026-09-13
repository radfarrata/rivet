import React from 'react';
import CalibrationReliability from '@/components/rivet/integrity/CalibrationReliability';
import JudgeAgreementDetails from '@/components/rivet/integrity/JudgeAgreementDetails';
import JudgeRankingAgreement from '@/components/rivet/integrity/JudgeRankingAgreement';
export default function IntegrityMetrics({ metrics }) {
  if (!metrics) return null;
  const value = n => n == null ? 'Not available' : `${n.toFixed(1)}%`;
  return <section className="rounded-xl border border-border bg-card p-4 space-y-2">
    <h3 className="font-semibold">Review agreement & judge calibration</h3>
    <div className="grid gap-3 sm:grid-cols-2 text-sm">
      <p>Observed reviewer agreement: <strong>{value(metrics.agreement)}</strong><span className="block text-xs text-muted-foreground">{metrics.pairCount} review pairs · {metrics.pairedResults} multiply-reviewed results</span></p>
      <p>Judge vs final human verdict: <strong>{value(metrics.judgeHumanAgreement)}</strong><span className="block text-xs text-muted-foreground">{metrics.calibrationResults} adjudicated results · absolute score error {metrics.meanAbsoluteError == null ? 'not available' : metrics.meanAbsoluteError.toFixed(1)}</span></p>
    </div>
    <CalibrationReliability metrics={metrics} />
    <JudgeAgreementDetails metrics={metrics} />
    <JudgeRankingAgreement groups={metrics.rankingAgreement} />
    <p className="text-xs text-muted-foreground">{metrics.protocol} All verified reviewers have equal weight. Missing observations are not counted as agreement.</p>
  </section>;
}