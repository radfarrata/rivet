// Shared evaluation math: blends automated + human evidence and builds per-model provenance.

export const FAILURE_LABELS = {
  hallucination: 'Hallucination', reasoning_error: 'Reasoning error', factual_error: 'Factual error', incomplete: 'Incomplete',
  instruction_violation: 'Instruction violation', safety_issue: 'Safety issue', formatting: 'Formatting', other: 'Other',
};

export const visibleTo = (tasks, user) => tasks.filter(t => t.visibility !== 'private' || t.created_by_id === user?.id);

export function confidenceLabel(n) {
  if (n >= 10) return 'High';
  if (n >= 3) return 'Medium';
  return 'Low';
}

export function summarizeHuman(evals) {
  if (!evals.length) return null;
  const avg = evals.reduce((s, e) => s + (e.score || 0), 0) / evals.length;
  const counts = {};
  evals.forEach(e => { counts[e.verdict] = (counts[e.verdict] || 0) + 1; });
  const top = Math.max(...Object.values(counts));
  return { avg, n: evals.length, agreement: Math.round((top / evals.length) * 100) };
}

export function blendedScore(result, human) {
  return human ? Math.round((result.score + human.avg) / 2) : result.score;
}

export function aggregateModels(results, humanEvals, tasks, domain = 'all') {
  const byResult = {};
  humanEvals.forEach(e => { (byResult[e.resultId] = byResult[e.resultId] || []).push(e); });
  const taskById = Object.fromEntries(tasks.map(t => [t.id, t]));
  const agg = {};

  results.filter(r => domain === 'all' || r.domain === domain).forEach(r => {
    const evals = byResult[r.id] || [];
    const human = summarizeHuman(evals);
    const score = blendedScore(r, human);
    const a = agg[r.modelId] = agg[r.modelId] || {
      modelId: r.modelId, model: r.model, n: 0, total: 0, autoTotal: 0, humanN: 0,
      evaluators: new Set(), tasks: new Set(), domains: new Set(), difficulty: {}, failures: {}, history: [], agreementSum: 0, agreementN: 0,
    };
    const t = taskById[r.taskId];
    const diff = t?.difficulty || 'intermediate';
    a.n += 1; a.total += score; a.autoTotal += r.score; a.tasks.add(r.taskId); a.domains.add(r.domain);
    a.difficulty[diff] = (a.difficulty[diff] || 0) + 1;
    evals.forEach(e => {
      a.humanN += 1; a.evaluators.add(e.evaluatorId);
      if (e.failureCategory && e.failureCategory !== 'none') a.failures[e.failureCategory] = (a.failures[e.failureCategory] || 0) + 1;
    });
    if (human) { a.agreementSum += human.agreement; a.agreementN += 1; }
    a.history.push({ ...r, score, autoScore: r.score, human, date: r.created_date, creator: t?.creatorName, criteria: t?.evaluationCriteria, difficulty: diff });
  });

  return Object.values(agg).map(a => {
    const history = a.history.sort((x, y) => new Date(y.date) - new Date(x.date));
    const byScore = [...history].sort((x, y) => y.score - x.score);
    return {
      ...a, history, avg: a.total / a.n, autoAvg: a.autoTotal / a.n,
      evaluators: a.evaluators.size, taskCount: a.tasks.size, domains: [...a.domains],
      agreement: a.agreementN ? Math.round(a.agreementSum / a.agreementN) : null,
      confidence: confidenceLabel(a.n), best: byScore[0], worst: byScore[byScore.length - 1],
    };
  }).sort((a, b) => b.avg - a.avg);
}

export function monthlyTrend(results, humanEvals) {
  const byResult = {};
  humanEvals.forEach(e => { (byResult[e.resultId] = byResult[e.resultId] || []).push(e); });
  const buckets = {};
  results.forEach(r => {
    const month = (r.created_date || '').slice(0, 7);
    if (!month) return;
    const b = buckets[month] = buckets[month] || {};
    const m = b[r.model] = b[r.model] || { total: 0, n: 0 };
    m.total += blendedScore(r, summarizeHuman(byResult[r.id] || [])); m.n += 1;
  });
  return Object.keys(buckets).sort().map(month => {
    const row = { month };
    Object.entries(buckets[month]).forEach(([model, m]) => { row[model] = Math.round(m.total / m.n); });
    return row;
  });
}