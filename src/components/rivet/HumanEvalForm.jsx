import React, { useState } from 'react';
import { Loader2, UserCheck } from 'lucide-react';
import { useCreateHumanEvaluation } from './useHumanEvaluations';
import { FAILURE_LABELS } from './evalStats';

const VERDICTS = [
  { id: 'pass', label: 'Pass', cls: 'bg-[#2fd4a7]/15 text-[#2fd4a7] border-[#2fd4a7]/40' },
  { id: 'partial', label: 'Partial', cls: 'bg-[#f5b544]/15 text-[#f5b544] border-[#f5b544]/40' },
  { id: 'fail', label: 'Fail', cls: 'bg-[#ff6b6b]/15 text-[#ff6b6b] border-[#ff6b6b]/40' },
];

export default function HumanEvalForm({ task, result, currentUser, alreadyEvaluated }) {
  const [score, setScore] = useState(70);
  const [verdict, setVerdict] = useState('pass');
  const [category, setCategory] = useState('none');
  const [notes, setNotes] = useState('');
  const create = useCreateHumanEvaluation();

  if (alreadyEvaluated) {
    return <p className="text-xs text-[#2fd4a7] flex items-center gap-1.5"><UserCheck size={13} /> You've evaluated this response. Thanks for contributing.</p>;
  }

  const submit = () => create.mutate({
    taskId: task.id, resultId: result.id, modelId: result.modelId, model: result.model, domain: task.domain,
    evaluatorId: currentUser?.id, evaluatorName: currentUser?.full_name || 'Anonymous',
    score, verdict, failureCategory: verdict === 'pass' ? 'none' : category, notes: notes.trim() || undefined,
  }, { onSuccess: () => setNotes('') });

  return (
    <div className="bg-[#0e1017] border border-[#1f232e] rounded-xl p-3 space-y-3">
      <p className="text-[11px] font-semibold text-white flex items-center gap-1.5"><UserCheck size={13} className="text-[#b06d97]" /> Add your human evaluation</p>
      <div className="flex items-center gap-3">
        <input type="range" min={0} max={100} value={score} onChange={e => setScore(Number(e.target.value))} className="flex-1 accent-[#653653]" />
        <span className="text-sm font-bold text-white w-10 text-right">{score}%</span>
      </div>
      <div className="flex gap-1.5">
        {VERDICTS.map(v => (
          <button key={v.id} onClick={() => setVerdict(v.id)} className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${verdict === v.id ? v.cls : 'border-[#1f232e] text-[#8b90a0] hover:text-white'}`}>{v.label}</button>
        ))}
      </div>
      {verdict !== 'pass' && (
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#12141b] border border-[#1f232e] rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
          <option value="none">Failure category…</option>
          {Object.entries(FAILURE_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      )}
      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="What did the model get right or wrong against the criteria?" className="w-full bg-[#12141b] border border-[#1f232e] rounded-lg px-3 py-2 text-xs text-white placeholder-[#6b7080] focus:outline-none focus:border-[#653653]/60 resize-none" />
      <div className="flex justify-end">
        <button onClick={submit} disabled={create.isPending} className="bg-[#653653] hover:bg-[#7c4165] disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
          {create.isPending && <Loader2 size={12} className="animate-spin" />} Submit evaluation
        </button>
      </div>
    </div>
  );
}