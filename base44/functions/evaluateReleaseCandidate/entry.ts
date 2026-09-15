import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const policyVersion = 'rivet-release-gate/1.0';
const hash = async (value) => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
};
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in to evaluate a release candidate.' }, { status: 401 });
    const payload = await req.json();
    const submitted = Array.isArray(payload.results) ? payload.results : [];
    const tests = await base44.entities.RegressionTest.filter({ active: true }, '-created_date', 200);
    if (!tests.length) return Response.json({ error: 'At least one active expert-verified regression test is required.' }, { status: 400 });
    let candidate = payload.candidateId ? await base44.entities.ReleaseCandidate.get(payload.candidateId) : null;
    const agentName = String(candidate?.agentName || payload.agentName || '').trim();
    const version = String(candidate?.version || payload.version || '').trim();
    if (!candidate && (!agentName || !version)) return Response.json({ error: 'System name and version are required.' }, { status: 400 });
    const submittedAt = new Date().toISOString();
    if (!candidate) candidate = await base44.entities.ReleaseCandidate.create({ agentId: String(payload.agentId || agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-')), agentName, version, status: 'running', totalTests: tests.length, triggeredBy: user.full_name || user.email, submittedAt, gatePolicyVersion: policyVersion });
    const byTest = new Map(submitted.map(result => [result.testId, result]));
    const severity = { critical: 0, high: 1, medium: 2, low: 3 };
    const results = tests.map(test => { const input = byTest.get(test.id); return { testId: test.id, name: test.name, severity: test.severity || 'medium', rule: test.rule, expectedBehavior: test.expectedBehavior || '', passed: input?.passed === true, evidenceUri: String(input?.evidenceUri || ''), notes: String(input?.notes || ''), submitted: !!input }; }).sort((a, b) => severity[a.severity] - severity[b.severity] || a.name.localeCompare(b.name));
    const failed = results.filter(result => !result.passed);
    const snapshot = { policyVersion, candidateId: candidate.id, agentId: candidate.agentId, version: candidate.version, tests: results };
    const update = { status: failed.length ? 'blocked' : 'passed', totalTests: results.length, passedTests: results.length - failed.length, failedTests: failed.length, blockingTestId: failed[0]?.testId || '', blockingTestName: failed[0]?.name || '', results, completedAt: new Date().toISOString(), gatePolicyVersion: policyVersion, gateSnapshotHash: await hash(snapshot) };
    const saved = await base44.entities.ReleaseCandidate.update(candidate.id, update);
    return Response.json(saved);
  } catch (error) {
    return Response.json({ error: error.message || 'Release gate evaluation failed.' }, { status: 500 });
  }
}