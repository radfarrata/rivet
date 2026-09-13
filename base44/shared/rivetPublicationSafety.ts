export const SAFEGUARDS_VERSION = 'publication-safeguards-1.0';
export const SCAN_PROTOCOL = 'authorized-corpus-2.0';
export function publicationSafetyReasons(e, v, q) {
  const reasons = [];
  // No trusted external runner exists. Never accept a client-supplied attestation flag.
  if (e?.executionSource !== 'server_integration' || e?.methodologyVersion === 'open-weight-core-1.0') {
    reasons.push('Execution origin unverified: imported or legacy outputs cannot be officially published.');
  }
  if (v?.contaminationRisk !== 'no_match_found' || q?.risk !== 'no_match_found') {
    reasons.push('Contamination clearance missing: only no-match evidence can qualify.');
  }
  const linked = !!(q && v && e && q.id === v.qualityAssessmentId && q.taskId === v.taskId && q.taskVersionId === v.id && q.methodologyVersion === v.methodologyVersion && q.methodologyVersion === e.methodologyVersion && q.taskSnapshotHash === v.snapshotHash);
  const coverage = q?.scanProtocol === SCAN_PROTOCOL && q?.scanStatus === 'complete' && Number.isInteger(q?.eligiblePeerCount) && q.eligiblePeerCount >= 0 && q.checkedPeerCount === q.eligiblePeerCount && q.failedPeerCount === 0;
  if (!linked || !coverage) reasons.push('Contamination scan incomplete or legacy: complete, snapshot-linked corpus coverage is required.');
  const checks = Array.isArray(q?.checks) ? q.checks : [];
  const resolved = [0,1,2,3,4,5].every(rung => {
    const matches = checks.filter(c => c.rung === rung);
    return matches.length === 1 && (matches[0].status === 'pass' || ([4,5].includes(rung) && matches[0].status === 'not_applicable'));
  }) && checks.every(c => ['pass','not_applicable'].includes(c.status));
  if (!resolved) reasons.push('Contamination checks unresolved: pending manual checks and flags block official publication.');
  return reasons;
}