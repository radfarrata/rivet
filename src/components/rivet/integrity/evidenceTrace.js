export default function evidenceTrace(data) {
  const text = value => typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  const step = (id, title, content, type = 'input') => ({ id, title, content: text(content), type });
  const d = data;
  const steps = [
    step('version', 'Task version, experiment & quality', d.legacy ? 'Legacy result: original task version, execution configuration and methodology were not captured.' : { ...d.version, methodology: d.evidence.methodologyVersion, experimentKey: d.run?.experimentKey, contaminationLadder: d.quality, taskSnapshot: d.snapshot }),
    step('prompt', 'Exact submitted prompt', d.bundle?.prompt || 'Not captured for this legacy result. The current task text is not proof of the historical prompt.'),
    step('model', 'Run trace & model identity', d.legacy ? { model: d.result.model, revision: 'Unknown' } : { runId:d.run?.id, experimentKey:d.run?.experimentKey, spans:d.run?.spans, requested: d.evidence.modelId, resolution: d.evidence.modelResolution, providerRevision: d.evidence.providerRevision || 'Not exposed by integration', startedAt: d.evidence.startedAt, completedAt: d.evidence.completedAt }),
    step('output', 'Raw model output', d.bundle?.output || d.result.rawResponse || 'No raw output was captured.', 'output'),
    step('judge', 'Structured judge decision', d.bundle ? { judge: d.bundle.judge, excerptIsVerbatim: d.bundle.excerptVerified, judgeRequested: d.bundle.judgeRequested, exactJudgePrompt: d.bundle.judgePrompt } : { legacySummary: d.result.summary, score: d.result.score }, 'tool_result'),
    ...d.reviews.map(r => step(r.id, `${r.evaluatorName} · ${r.verdict} · ${r.score}`, { score: r.score, verdict: r.verdict, feedback: r.notes, credentialAtReview: r.credentialStatusAtReview || 'Legacy / unverified', conflicts: r.conflictDeclaration || 'Not recorded', protocol: r.reviewProtocol || 'Legacy', time: r.created_date }, 'tool_result')),
    step('final', 'Final adjudication', d.finals.length ? d.finals : 'Pending; no final human adjudication has been recorded.', 'tool_result'),
    step('metrics', 'Agreement, uncertainty & disagreements', { ...d.metrics, sampleSize: 'One task result; no population confidence interval.', conflictingVerdicts: [...new Set(d.reviews.map(r => r.verdict))], publicationEligible: d.officialEligible }, 'tool_result'),
    step('audit', 'Provenance audit trail', { runId:d.run?.id || 'Legacy', rootArtifactId:d.run?.rootArtifactId || 'Unavailable', artifactHash: d.evidence?.artifactHash || 'Unavailable', events: d.events }, 'tool_result')
  ];
  return { id: d.result.id, caseTitle: d.task.title, agentName: d.result.model, runId: d.evidence?.id || 'Legacy', status: d.finals.length ? 'adjudicated' : 'needs_review', steps, flaggedStepIds: [] };
}