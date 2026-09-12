import React from 'react';
import EvidenceLink from '@/components/rivet/integrity/EvidenceLink';
export default function HumanEvalForm({ result, alreadyEvaluated }) {
  return <div className="dark rounded-xl border border-border bg-card p-3 space-y-2 text-foreground"><p className="text-xs text-muted-foreground">{alreadyEvaluated ? 'Your review is recorded in the evidence history.' : 'Review the captured prompt, output and rubric before submitting a verified, conflict-declared expert evaluation.'}</p><EvidenceLink resultId={result.id} legacy={!result.evidenceId} /></div>;
}