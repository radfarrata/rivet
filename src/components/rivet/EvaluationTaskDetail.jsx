import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Play, Loader2, ChevronDown, CheckCircle2, Trophy } from 'lucide-react';
import { useModelResults } from './useEvaluations';
import { runEvaluation } from './runEvaluation';
import { domainLabel, modelLabel } from './evalModels';

export default function EvaluationTaskDetail({ task, onClose }) {
  const queryClient = useQueryClient();
  const { data: allResults = [] } = useModelResults();
  const [progress, setProgress] = useState(null);
  const [openModel, setOpenModel] = useState(null);
  const results = allResults.filter(r => r.taskId === task.id).sort((a, b) => b.score - a.score);
  const bestScore = results[0]?.score;

  const run = useMutation({
    mutationFn: () => runEvaluation(task, setProgress),
    onSuccess: () => {
      setProgress(null);
      queryClient.invalidateQueries({ queryKey: ['rivet-model-results'] });
      queryClient.invalidateQueries({ queryKey: ['rivet-eval-tasks'] });
    },
    onError: () => setProgress(null),
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#ffffff] rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto border border-[#e4e6eb]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#e4e6eb] px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-[#f2e7ef] text-[#653653] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">{domainLabel(task.domain)}</span>
              <span className="text-[10px] bg-[#f0f2f5] text-[#65676b] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide capitalize">{task.difficulty}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${task.status === 'evaluated' ? 'bg-[#31a24c]/10 text-[#31a24c]' : task.status === 'running' ? 'bg-amber-100 text-amber-700' : 'bg-[#f0f2f5] text-[#65676b]'}`}>
                {task.status === 'evaluated' ? 'Evaluated' : task.status === 'running' ? 'Running' : 'Pending'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#050505] mt-1.5">{task.title}</h2>
            <p className="text-xs text-[#65676b]">Task created by <span className="font-semibold text-[#050505]">{task.creatorName || 'You'}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-[#65676b] hover:text-[#050505] hover:bg-[#f0f2f5] rounded-lg transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Task + criteria + models — provenance of the evaluation */}
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold text-[#65676b] uppercase tracking-wide mb-1">The Task</p>
              <p className="text-sm text-[#1c1e21] whitespace-pre-wrap leading-relaxed bg-[#f0f2f5] rounded-lg p-3">{task.prompt}</p>
            </div>
            {task.evaluationCriteria && (
              <div>
                <p className="text-[11px] font-semibold text-[#65676b] uppercase tracking-wide mb-1">Evaluation Criteria</p>
                <p className="text-sm text-[#1c1e21] whitespace-pre-wrap leading-relaxed bg-[#f0f2f5] rounded-lg p-3">{task.evaluationCriteria}</p>
              </div>
            )}
            <div className="flex gap-1.5 flex-wrap">
              {(task.models || []).map(id => <span key={id} className="text-[10px] px-2.5 py-1 rounded-full bg-[#653653]/10 text-[#653653] font-semibold">{modelLabel(id)}</span>)}
            </div>
          </div>

          {/* Run control */}
          {task.status === 'pending' && (
            <button onClick={() => run.mutate()} disabled={run.isPending} className="w-full flex items-center justify-center gap-2 bg-[#653653] hover:bg-[#522b42] disabled:opacity-60 text-white rounded-xl py-3 text-sm font-semibold transition-colors">
              {run.isPending ? <><Loader2 size={16} className="animate-spin" /> Running evaluation...</> : <><Play size={16} /> Run multi-model evaluation</>}
            </button>
          )}
          {run.isPending && progress && (
            <div className="bg-[#f0f2f5] rounded-xl p-4 space-y-2">
              {progress.stage === 'generating' ? (
                <p className="text-xs text-[#65676b] flex items-center gap-2"><Loader2 size={14} className="animate-spin text-[#653653]" /> Getting response from <span className="font-semibold text-[#050505]">{progress.label}</span>...</p>
              ) : (
                <p className="text-xs text-[#65676b] flex items-center gap-2"><Loader2 size={14} className="animate-spin text-[#653653]" /> Judging responses against the criteria...</p>
              )}
            </div>
          )}

          {/* Results comparison */}
          {results.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-[#050505]">Model comparison — why each score</p>
              {results.map(r => (
                <div key={r.modelId} className="rounded-xl border border-[#e4e6eb] overflow-hidden">
                  <button onClick={() => setOpenModel(openModel === r.modelId ? null : r.modelId)} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[#f0f2f5] transition-colors">
                    {r.score === bestScore && <Trophy size={16} className="text-[#653653] flex-shrink-0" />}
                    <span className="text-sm font-semibold text-[#050505]">{r.model}</span>
                    <div className="flex-1 h-2 bg-[#f0f2f5] rounded-full overflow-hidden min-w-[60px]">
                      <div className="h-full bg-[#653653] rounded-full" style={{ width: `${r.score}%` }} />
                    </div>
                    <span className="text-sm font-bold text-[#653653]">{r.score}%</span>
                    <ChevronDown size={16} className={`text-[#65676b] transition-transform ${openModel === r.modelId ? 'rotate-180' : ''}`} />
                  </button>
                  {openModel === r.modelId && (
                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#e4e6eb] bg-[#fafafa]">
                      <div>
                        <p className="text-[10px] font-semibold text-[#65676b] uppercase tracking-wide mb-0.5">Why this score</p>
                        <p className="text-sm text-[#1c1e21] leading-relaxed">{r.summary || '—'}</p>
                      </div>
                      {r.strengths && <div><p className="text-[10px] font-semibold text-[#31a24c] uppercase tracking-wide mb-0.5">Strengths</p><p className="text-sm text-[#1c1e21] leading-relaxed">{r.strengths}</p></div>}
                      {r.weaknesses && <div><p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-0.5">Weaknesses</p><p className="text-sm text-[#1c1e21] leading-relaxed">{r.weaknesses}</p></div>}
                      {r.failureModes && <div><p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide mb-0.5">Failure modes</p><p className="text-sm text-[#1c1e21] leading-relaxed">{r.failureModes}</p></div>}
                      <div>
                        <p className="text-[10px] font-semibold text-[#65676b] uppercase tracking-wide mb-0.5 flex items-center gap-1"><CheckCircle2 size={11} /> Judged by {r.judgedBy}</p>
                        <pre className="text-xs text-[#1c1e21] whitespace-pre-wrap bg-white border border-[#e4e6eb] rounded-lg p-3 max-h-64 overflow-y-auto font-sans">{r.rawResponse}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}