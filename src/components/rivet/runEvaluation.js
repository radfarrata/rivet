import { base44 } from '@/api/base44Client';
import { RIVET_MODELS } from './evalModels';

export async function runEvaluation(task, onProgress = () => {}) {
  await base44.entities.EvaluationTask.update(task.id, { status: 'running' });
  try {
    return await runInner(task, onProgress);
  } catch (err) {
    // Never leave a task stuck in "running" — let the creator retry.
    await base44.entities.EvaluationTask.update(task.id, { status: 'pending' });
    throw err;
  }
}

async function runInner(task, onProgress) {
  // 1. Get an answer from each selected model on the exact same task
  const outputs = [];
  for (const modelId of task.models) {
    const label = RIVET_MODELS.find(m => m.id === modelId)?.label || modelId;
    onProgress({ stage: 'generating', modelId, label });
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI system being evaluated on a real-world task.\n\nDomain: ${task.domain}\nDifficulty: ${task.difficulty}\n\nTask:\n${task.prompt}\n\nEvaluation criteria:\n${task.evaluationCriteria || 'Accuracy, correctness, and completeness of the answer.'}\n\nProvide your best possible answer.`,
      model: modelId,
    });
    const output = typeof res === 'string' ? res : String(res?.response ?? res?.text ?? JSON.stringify(res));
    outputs.push({ modelId, label, output });
  }

  // 2. Judge all outputs against the evaluation criteria
  onProgress({ stage: 'judging' });
  const numbered = outputs.map((o, i) => `[${i + 1}] (${o.modelId})\n${o.output}`).join('\n\n---\n\n');
  const judge = await base44.integrations.Core.InvokeLLM({
    prompt: `You are Rivet's automated evaluation judge. Score each AI model's response to the SAME real-world task, 0-100, strictly against the evaluation criteria.\n\nTask:\n${task.prompt}\n\nDomain: ${task.domain}\nDifficulty: ${task.difficulty}\nEvaluation criteria:\n${task.evaluationCriteria || 'Accuracy, correctness, and completeness of the answer.'}\n\nResponses:\n\n${numbered}\n\nReturn one result per response with: modelId (exactly as given in parentheses), score (0-100 number), summary (1-2 sentences: WHY this score, citing the criteria), strengths, weaknesses, and failureModes (specific failure categories observed, or empty string).`,
    response_json_schema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              modelId: { type: 'string' },
              score: { type: 'number' },
              summary: { type: 'string' },
              strengths: { type: 'string' },
              weaknesses: { type: 'string' },
              failureModes: { type: 'string' },
            },
            required: ['modelId', 'score', 'summary'],
          },
        },
      },
      required: ['results'],
    },
  });

  // 3. Persist structured, auditable results
  const byId = Object.fromEntries((judge.results || []).map(r => [r.modelId, r]));
  const records = outputs.map(o => ({
    taskId: task.id,
    taskTitle: task.title,
    domain: task.domain,
    modelId: o.modelId,
    model: o.label,
    score: Math.round(byId[o.modelId]?.score ?? 0),
    summary: byId[o.modelId]?.summary || '',
    strengths: byId[o.modelId]?.strengths || '',
    weaknesses: byId[o.modelId]?.weaknesses || '',
    failureModes: byId[o.modelId]?.failureModes || '',
    rawResponse: o.output,
    judgedBy: 'Rivet automated judge',
  }));
  await base44.entities.ModelResult.bulkCreate(records);
  await base44.entities.EvaluationTask.update(task.id, { status: 'evaluated' });
  return records;
}