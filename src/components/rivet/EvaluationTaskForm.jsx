import React, { useState } from 'react';
import { Plus, X, FlaskConical, Lock, Globe } from 'lucide-react';
import { useCreateEvaluationTask } from './useEvaluations';
import { RIVET_MODELS, DOMAINS, DIFFICULTIES } from './evalModels';
import LabTemplatePicker from '@/components/rivet/evaluation/LabTemplatePicker';
import TaskWorkspaceSelect from '@/components/rivet/integrity/TaskWorkspaceSelect';

const inputCls = 'w-full bg-[#0e1017] border border-[#1f232e] rounded-lg px-3 py-2 text-sm text-white placeholder-[#6b7080] focus:outline-none focus:border-[#653653]/60';
const selectCls = 'bg-[#0e1017] border border-[#1f232e] rounded-lg px-3 py-2 text-sm text-white focus:outline-none capitalize';
const Chip = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${active ? 'bg-[#653653] text-white' : 'bg-[#1a1d29] text-[#8b90a0] hover:text-white'}`}>{children}</button>
);

export default function EvaluationTaskForm({ currentUser, onCreated, enableTemplates = false }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', prompt: '', domain: 'reasoning', difficulty: 'intermediate', criteria: '', evaluationType: 'hybrid', visibility: 'public', models: ['gpt_5_mini', 'claude-sonnet-5'] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const create = useCreateEvaluationTask();
  const valid = form.title.trim() && form.prompt.trim() && form.models.length >= 2;
  const loadTemplate = (template) => {
    if ((form.title.trim() || form.prompt.trim() || form.criteria.trim()) && !window.confirm('Replace your current title, scenario, and criteria with this template?')) return;
    setForm(f => ({ ...f, title: template.label, prompt: template.prompt, domain: template.domain, difficulty: template.difficulty, criteria: template.criteria }));
    setOpen(true);
  };
  const templatePicker = enableTemplates ? <LabTemplatePicker onLoad={loadTemplate} disabled={create.isPending} /> : null;

  const handleSubmit = () => {
    if (!valid) return;
    create.mutate({
      title: form.title, prompt: form.prompt, domain: form.domain, difficulty: form.difficulty,
      evaluationCriteria: form.criteria.trim() || undefined, evaluationType: form.evaluationType, visibility: form.workspaceId ? 'private' : form.visibility, workspaceId: form.workspaceId || '',
      models: form.models, status: 'pending', creatorName: currentUser?.full_name || 'You',
    }, { onSuccess: (task) => { setForm(f => ({ ...f, title: '', prompt: '', criteria: '' })); setOpen(false); onCreated?.(task); } });
  };

  if (!open) {
    return (
      <div className="space-y-3">
      {templatePicker}
      <button onClick={() => setOpen(true)} className="w-full bg-[#653653] hover:bg-[#7c4165] text-white rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(109,93,252,0.3)]">
        <Plus size={18} /> Create an evaluation task
      </button>
      </div>
    );
  }

  return (
    <div className="bg-[#12141b] rounded-2xl border border-[#1f232e] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><FlaskConical size={16} className="text-[#b06d97]" /> New Evaluation Task</h3>
        <button onClick={() => setOpen(false)} className="text-[#8b90a0] hover:text-white"><X size={18} /></button>
      </div>
      {templatePicker}
      <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Title — e.g. Experimental design comparison" className={inputCls} />
      <textarea value={form.prompt} onChange={e => set('prompt', e.target.value)} placeholder="The real-world problem, research question, coding bug, or safety test every model must answer..." rows={4} className={`${inputCls} resize-none`} />
      <div className="flex gap-2 flex-wrap">
        <select value={form.domain} onChange={e => set('domain', e.target.value)} className={selectCls}>{DOMAINS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}</select>
        <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)} className={selectCls}>{DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}</select>
        <select value={form.evaluationType} onChange={e => set('evaluationType', e.target.value)} className={selectCls}>
          <option value="hybrid">Human + Automated</option><option value="automated">Automated only</option><option value="human">Human only</option>
        </select>
      </div>
      <textarea aria-label="Evaluation criteria and scoring metrics" value={form.criteria} onChange={e => set('criteria', e.target.value)} placeholder="Evaluation criteria — how should responses be judged?" rows={enableTemplates ? 6 : 2} className={`${inputCls} resize-none`} />
      <div>
        <p className="text-[10px] font-semibold text-[#8b90a0] uppercase tracking-wide mb-1.5">Models to compare (min 2)</p>
        <div className="flex gap-1.5 flex-wrap">
          {RIVET_MODELS.map(m => <Chip key={m.id} active={form.models.includes(m.id)} onClick={() => set('models', form.models.includes(m.id) ? form.models.filter(x => x !== m.id) : [...form.models, m.id])}>{m.label}</Chip>)}
        </div>
      </div>
      {form.visibility === 'private' && <div className="dark"><TaskWorkspaceSelect value={form.workspaceId} onChange={value => set('workspaceId', value)} /></div>}
      {create.isError && <p role="alert" className="text-sm text-destructive">{create.error?.message || 'Could not create the task. Please try again.'}</p>}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1.5">
          <Chip active={form.visibility === 'public'} onClick={() => setForm(f => ({ ...f, visibility: 'public', workspaceId: '' }))}><span className="flex items-center gap-1"><Globe size={12} /> Public</span></Chip>
          <Chip active={form.visibility === 'private'} onClick={() => set('visibility', 'private')}><span className="flex items-center gap-1"><Lock size={12} /> Private</span></Chip>
        </div>
        <button onClick={handleSubmit} disabled={create.isPending || !valid} className="bg-[#653653] hover:bg-[#7c4165] disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold">
          {create.isPending ? 'Creating...' : 'Create task'}
        </button>
      </div>
    </div>
  );
}