import React, { useState } from 'react';
import { Plus, X, FlaskConical } from 'lucide-react';
import { useCreateEvaluationTask } from './useEvaluations';
import { RIVET_MODELS, DOMAINS, DIFFICULTIES } from './evalModels';

export default function EvaluationTaskForm({ currentUser, onCreated }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [domain, setDomain] = useState('reasoning');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [criteria, setCriteria] = useState('');
  const [models, setModels] = useState(['gpt_5_mini', 'claude-sonnet-5']);
  const create = useCreateEvaluationTask();

  const toggleModel = (id) =>
    setModels(m => (m.includes(id) ? m.filter(x => x !== id) : [...m, id]));

  const handleSubmit = () => {
    if (!title.trim() || !prompt.trim() || models.length < 2) return;
    create.mutate({
      title, prompt, domain, difficulty,
      evaluationCriteria: criteria.trim() || undefined,
      models, status: 'pending',
      creatorName: currentUser?.full_name || 'You',
    }, {
      onSuccess: (task) => {
        setTitle(''); setPrompt(''); setCriteria('');
        setOpen(false);
        onCreated?.(task);
      },
    });
  };

  const inputCls = "w-full bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg px-3 py-2 text-sm text-[#050505] placeholder-[#65676b] focus:outline-none focus:border-[#653653]";

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full bg-[#653653] hover:bg-[#522b42] text-white rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
        <Plus size={18} /> Create an evaluation task
      </button>
    );
  }

  return (
    <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#050505] flex items-center gap-2"><FlaskConical size={16} className="text-[#653653]" /> New Evaluation Task</h3>
        <button onClick={() => setOpen(false)} className="text-[#65676b] hover:text-[#050505]"><X size={18} /></button>
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title — e.g. Experimental design comparison" className={inputCls} />
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="The real-world problem or question every model must answer..." rows={4} className={`${inputCls} resize-none`} />
      <div className="flex gap-2 flex-wrap">
        <select value={domain} onChange={e => setDomain(e.target.value)} className="bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg px-3 py-2 text-sm text-[#050505] focus:outline-none focus:border-[#653653]">
          {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg px-3 py-2 text-sm text-[#050505] focus:outline-none focus:border-[#653653] capitalize">
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <textarea value={criteria} onChange={e => setCriteria(e.target.value)} placeholder="Evaluation criteria — how should responses be judged?" rows={2} className={`${inputCls} resize-none`} />
      <div>
        <p className="text-[11px] font-semibold text-[#65676b] uppercase tracking-wide mb-1.5">Models to compare (min 2)</p>
        <div className="flex gap-1.5 flex-wrap">
          {RIVET_MODELS.map(m => (
            <button key={m.id} onClick={() => toggleModel(m.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${models.includes(m.id) ? 'bg-[#653653] text-white' : 'bg-[#f0f2f5] text-[#65676b] hover:bg-[#f2e7ef] hover:text-[#653653]'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSubmit} disabled={create.isPending || !title.trim() || !prompt.trim() || models.length < 2} className="bg-[#653653] hover:bg-[#522b42] disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
          {create.isPending ? 'Creating...' : 'Create task'}
        </button>
      </div>
    </div>
  );
}