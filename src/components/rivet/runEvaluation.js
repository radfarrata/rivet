import { base44 } from '@/api/base44Client';
import { RIVET_MODELS } from './evalModels';
export async function runEvaluation(task, onProgress = () => {}) {
  const prepared = await base44.functions.invoke('rivetRun', { action: 'prepare', taskId: task.id });
  const { versionId, models } = prepared.data;
  const results = [];
  for (const modelId of models) {
    onProgress({ stage: 'generating', modelId, label: RIVET_MODELS.find(m => m.id === modelId)?.label || modelId });
    const response = await base44.functions.invoke('rivetRun', { action: 'model', taskId: task.id, versionId, modelId });
    if (response.data.error) throw new Error(response.data.error);
    results.push(response.data);
  }
  return results;
}