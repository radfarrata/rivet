// Feed math: turns raw results + human evals into "verdicts" (one claim per task, with proof)
// and "movements" (a model's score shifting over time).
import { summarizeHuman, blendedScore, confidenceLabel } from '../evalStats';

/** One verdict per task: ranked models, margin, disagreement, and whether humans overruled the judge. */
export function buildVerdicts(tasks, results, humanEvals) {
  const evalsByResult = {};
  humanEvals.forEach(e => { (evalsByResult[e.resultId] = evalsByResult[e.resultId] || []).push(e); });

  const resultsByTask = {};
  results.forEach(r => { (resultsByTask[r.taskId] = resultsByTask[r.taskId] || []).push(r); });

  return tasks
    .map(task => {
      const rows = (resultsByTask[task.id] || []).map(r => {
        const evals = evalsByResult[r.id] || [];
        const human = summarizeHuman(evals);
        return {
          resultId: r.id, modelId: r.modelId, model: r.model,
          score: blendedScore(r, human), autoScore: r.score,
          human, summary: r.summary, weaknesses: r.weaknesses,
          evaluatorCount: evals.length,
        };
      });
      if (!rows.length) return null;

      const ranked = [...rows].sort((a, b) => b.score - a.score);
      const autoRanked = [...rows].sort((a, b) => b.autoScore - a.autoScore);
      const scores = ranked.map(r => r.score);
      const humanCount = rows.reduce((s, r) => s + r.evaluatorCount, 0);

      return {
        task, ranked,
        winner: ranked[0],
        margin: ranked.length > 1 ? ranked[0].score - ranked[1].score : null,
        spread: Math.max(...scores) - Math.min(...scores),
        overruled: humanCount > 0 && autoRanked[0].modelId !== ranked[0].modelId,
        autoWinner: autoRanked[0],
        humanCount,
        confidence: confidenceLabel(humanCount),
        date: ranked[0] && (resultsByTask[task.id][0]?.created_date || task.created_date),
      };
    })
    .filter(Boolean);
}

/** Flags a verdict where the winning model is not the platform's overall leader. */
export function markUpsets(verdicts) {
  const totals = {};
  verdicts.forEach(v => v.ranked.forEach(r => {
    const t = totals[r.modelId] = totals[r.modelId] || { total: 0, n: 0, model: r.model };
    t.total += r.score; t.n += 1;
  }));
  const leader = Object.entries(totals)
    .map(([modelId, t]) => ({ modelId, model: t.model, avg: t.total / t.n }))
    .sort((a, b) => b.avg - a.avg)[0];
  return verdicts.map(v => ({ ...v, upset: !!leader && v.ranked.length > 1 && v.winner.modelId !== leader.modelId, leader }));
}

/** Score movements: each model's recent average vs its earlier average, per domain. */
export function buildMovements(verdicts, minPerSide = 2) {
  const byModel = {};
  verdicts.forEach(v => v.ranked.forEach(r => {
    const key = `${r.modelId}|${v.task.domain || 'other'}`;
    (byModel[key] = byModel[key] || { model: r.model, modelId: r.modelId, domain: v.task.domain || 'other', points: [] })
      .points.push({ score: r.score, date: v.date });
  }));

  return Object.values(byModel)
    .map(m => {
      const points = m.points.filter(p => p.date).sort((a, b) => new Date(a.date) - new Date(b.date));
      if (points.length < minPerSide * 2) return null;
      const half = Math.floor(points.length / 2);
      const avg = arr => arr.reduce((s, p) => s + p.score, 0) / arr.length;
      const before = avg(points.slice(0, half));
      const after = avg(points.slice(half));
      const delta = Math.round(after - before);
      if (!delta) return null;
      return { ...m, before: Math.round(before), after: Math.round(after), delta, n: points.length };
    })
    .filter(Boolean)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

/** Injects movement cards into a verdict list every `every` rows. */
export function interleave(verdicts, movements, every = 8) {
  const out = [];
  let mi = 0;
  verdicts.forEach((v, i) => {
    out.push({ kind: 'verdict', key: `v-${v.task.id}`, data: v });
    if (i > 0 && (i + 1) % every === 0 && movements[mi]) {
      out.push({ kind: 'movement', key: `m-${mi}`, data: movements[mi] });
      mi += 1;
    }
  });
  return out;
}