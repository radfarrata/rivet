import React from 'react';
const pct = value => value == null ? 'Not available' : `${(value * 100).toFixed(1)}%`;
export default function CalibrationReliability({ metrics }) {
  const cards=[['Brier score',metrics.brierScore==null?'Not available':metrics.brierScore.toFixed(3)],['ECE · 10 equal-width',pct(metrics.ece)],['Max calibration error',pct(metrics.mce)],['Krippendorff α',metrics.krippendorffAlpha==null?'Not available':metrics.krippendorffAlpha.toFixed(3)]];
  return <div className="space-y-3">
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value])=><div key={label} className="rounded-lg border border-border bg-background p-3"><p className="text-xs text-muted-foreground">{label}</p><strong className="text-lg">{value}</strong></div>)}</div>
    <div className="grid grid-cols-10 gap-1 h-16 items-end" aria-label="Calibration reliability bins">{metrics.calibrationBins?.map(bin=><div key={bin.range} title={`${bin.range}: ${bin.n} items`} className="bg-primary/70 min-h-1 rounded-t" style={{height:`${bin.n?Math.max(8,(bin.accuracy||0)*100):4}%`,opacity:bin.n?1:.2}} />)}</div>
    <p className="text-xs text-muted-foreground">Bradley–Terry is not computed: Rivet currently records rubric scores, not randomized pairwise preference votes. Bootstrap intervals use matched task snapshots.</p>
    <p className="text-xs text-muted-foreground">{metrics.calibratedConfidenceResults} confidence-labelled adjudications · {metrics.highConfidenceErrors}/{metrics.highConfidenceCount} errors at confidence ≥0.90. Empty bins remain visible; unavailable metrics are never reported as zero.</p>
  </div>;
}