import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Play, Loader2, Lock, Globe, Bot, Users, User } from 'lucide-react';
import { useModelResults } from './useEvaluations';
import { useHumanEvaluations } from './useHumanEvaluations';
import { runEvaluation } from './runEvaluation';
import { domainLabel, modelLabel } from './evalModels';
import { summarizeHuman, blendedScore } from './evalStats';
import ModelResultCard from './ModelResultCard';

const Tag = ({ children, cls = 'bg-[#1f232e] text-[#b8bcc8]' }) => <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${cls}`}>{children}</span>;

export default function EvaluationTaskDetail({ task, onClose, currentUser }) {
  const queryClient = useQueryClient();
  const { data: allResults = [] } = useModelResults();
  const { data: humanEvals = [] } = useHumanEvaluations();
  const [progress, setProgress] = useState(null);
  const [openModel, setOpenModel] = useState(null);

  const results = allResults.filter(r => r.taskId === task.id).map(r => {
    const h = summarizeHuman(humanEvals.filter(e => e.resultId === r.id));
    return { ...r, human: h, blended: blendedScore(r, h) };
  }).sort((a, b) => b.blended - a.blended);
  const evaluatorCount = new Set(humanEvals.filter(e => e.taskId === task.id).map(e => e.evaluatorId)).size;

  const run = useMutation({
    mutationFn: () => runEvaluation(task, setProgress),
    onSuccess: () => { setProgress(null); queryClient.invalidateQueries({ queryKey: ['rivet-model-results'] }); queryClient.invalidateQueries({ queryKey: ['rivet-eval-tasks'] }); },
    onError: () => setProgress(null),
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0e1017] rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto border border-[#1f232e]" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0e1017]/95 backdrop-blur-md border-b border-[#1f232e] px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag cls="bg-[#b06d97]/15 text-[#b06d97]">{domainLabel(task.domain)}</Tag>
              <Tag>{task.difficulty}</Tag>
              <Tag cls={task.status === 'evaluated' ? 'bg-[#2fd4a7]/15 text-[#2fd4a7]' : task.status === 'running' ? 'bg-[#f5b544]/15 text-[#f5b544]' : ''}>{task.status}</Tag>
              <Tag>{task.visibility === 'private' ? <span className="flex items-center gap-1"><Lock size={10} /> Private</span> : <span className="flex items-center gap-1"><Globe size={10} /> Public</span>}</Tag>
            </div>
            <h2 className="text-lg font-bold text-white">{task.title}</h2>
            <div className="flex items-center gap-3 text-[11px] text-[#8b90a0] flex-wrap">
              <span className="flex items-center gap-1"><User size={11} /> Created by <span className="text-white font-semibold">{task.creatorName || 'You'}</span></span>
              <span className="flex items-center gap-1"><Bot size={11} /> Judge: Rivet automated</span>
              <span className="flex items-center gap-1"><Users size={11} /> {evaluatorCount} human evaluator{evaluatorCount === 1 ? '' : 's'}</span>
              <span className="capitalize">{task.evaluationType || 'hybrid'} evaluation</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#8b90a0] hover:text-white hover:bg-[#151823] rounded-lg"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-[10px] font-semibold text-[#8b90a0] uppercase tracking-wide mb-1">The task</p>
            <p className="text-sm text-[#d4d7e0] whitespace-pre-wrap leading-relaxed bg-[#12141b] border border-[#1f232e] rounded-xl p-3">{task.prompt}</p>
          </div>
          {task.evaluationCriteria && (
            <div>
              <p className="text-[10px] font-semibold text-[#8b90a0] uppercase tracking-wide mb-1">Evaluation criteria</p>
              <p className="text-sm text-[#d4d7e0] whitespace-pre-wrap leading-relaxed bg-[#12141b] border border-[#1f232e] rounded-xl p-3">{task.evaluationCriteria}</p>
            </div>
          )}
          <div className="flex gap-1.5 flex-wrap">{(task.models || []).map(id => <Tag key={id} cls="bg-[#b06d97]/10 text-[#b06d97]">{modelLabel(id)}</Tag>)}</div>

          {task.status === 'pending' && (
            <button onClick={() => run.mutate()} disabled={run.isPending} className="w-full flex items-center justify-center gap-2 bg-[#653653] hover:bg-[#7c4165] disabled:opacity-60 text-white rounded-xl py-3 text-sm font-semibold shadow-[0_0_20px_rgba(101,54,83,0.5)]">
              {run.isPending ? <><Loader2 size={16} className="animate-spin" /> Running evaluation...</> : <><Play size={16} /> Run multi-model evaluation</>}
            </button>
          )}
          {run.isPending && progress && (
            <p className="text-xs text-[#8b90a0] flex items-center gap-2 bg-[#12141b] border border-[#1f232e] rounded-xl p-3">
              <Loader2 size={14} className="animate-spin text-[#b06d97]" />
              {progress.stage === 'generating' ? <>Getting response from <span className="font-semibold text-white">{progress.label}</span>…</> : 'Judging responses against the criteria…'}
            </p>
          )}

          {results.length > 0 && (
            <div className="space-y-2.5">
              <div>
                <p className="text-sm font-bold text-white">Model comparison</p>
                <p className="text-[11px] text-[#8b90a0]">Scores blend the automated judge with community human evaluations. Expand a model to see the evidence and add your own evaluation.</p>
              </div>
              {results.map(r => (
                <ModelResultCard key={r.id} task={task} result={r} humanEvals={humanEvals.filter(e => e.resultId === r.id)} isBest={r.blended === results[0].blended} open={openModel === r.id} onToggle={() => setOpenModel(openModel === r.id ? null : r.id)} currentUser={currentUser} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}