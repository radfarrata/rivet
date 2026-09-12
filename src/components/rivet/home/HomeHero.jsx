import React, { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import Icon from '@/components/Icon';
import { useCreateEvaluationTask } from '../useEvaluations';
import { DOMAINS } from '../evalModels';
import TemplatePicker from './TemplatePicker';
import DocumentUpload from './DocumentUpload';

const EVAL_TYPES = [
  { id: 'hybrid', label: 'Human + Automated' },
  { id: 'automated', label: 'Automated only' },
  { id: 'human', label: 'Human only' },
];

const TABS = [
  { id: 'new', label: 'New Task', icon: 'edit' },
  { id: 'upload', label: 'Upload Document', icon: 'paperclip' },
  { id: 'template', label: 'From Template', icon: 'template' },
];

function LabeledSelect({ icon, label, value, options, onChange }) {
  return (
    <label className="relative flex items-center gap-2.5 bg-black border border-[#2f3336] hover:border-[#71767b] rounded-xl px-3 py-2 cursor-pointer flex-1 min-w-0">
      <Icon name={icon} size={15} className="text-[#71767b] flex-shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] text-[#71767b] leading-none">{label}</span>
        <span className="block text-[13px] text-white font-medium truncate mt-0.5">{options.find(o => o.id === value)?.label}</span>
      </span>
      <ChevronDown size={14} className="text-[#71767b]" />
      <select value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">
        {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}

export default function HomeHero({ currentUser, onNavigate }) {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('biology');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [evaluationType, setEvaluationType] = useState('hybrid');
  const [tab, setTab] = useState('new');
  const [fromUpload, setFromUpload] = useState(false);
  const create = useCreateEvaluationTask();

  const handleRun = () => {
    if (!prompt.trim()) return;
    create.mutate({
      title: (title || prompt).trim().slice(0, 80),
      prompt: prompt.trim(),
      domain, difficulty, evaluationType, visibility: fromUpload ? 'private' : 'public',
      models: ['gpt_5_mini', 'claude-sonnet-5', 'gemini_3_flash'],
      status: 'pending',
      creatorName: currentUser?.full_name || 'You',
    }, { onSuccess: () => { setPrompt(''); setTitle(''); onNavigate?.('evaluation-lab'); } });
  };

  const applyTemplate = (t) => { setTitle(t.label); setPrompt(t.prompt); setDomain(t.domain); setDifficulty(t.difficulty); setTab('new'); };

  return (
    <div className="px-4 py-3 border-b border-[#2f3336]">
      <div className="flex gap-1 border-b border-[#2f3336] mb-3">
        {TABS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`relative flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${tab === id ? 'text-white' : 'text-[#71767b] hover:text-white'}`}>
            <Icon name={icon} size={13} /> {label}
            {tab === id && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#b06d97]" />}
          </button>
        ))}
      </div>

      {tab === 'upload' && <div className="mb-3"><DocumentUpload onExtracted={(d) => { setTitle(d.title); setPrompt(d.prompt); setFromUpload(true); setTab('new'); }} /></div>}
      {tab === 'template' && <div className="mb-3"><TemplatePicker onPick={applyTemplate} /></div>}

      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1f232e] border border-[#2f3336] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {(currentUser?.full_name || 'You').slice(0, 1).toUpperCase()}
        </div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          placeholder='Describe your task… (e.g. "Given this paper and these constraints, which experimental design is most defensible?")'
          className="flex-1 bg-transparent text-[15px] text-white placeholder-[#71767b] focus:outline-none resize-none leading-relaxed pt-2"
        />
      </div>

      {fromUpload && <p className="text-xs text-muted-foreground">Document-derived tasks are private to you.</p>}
      {create.isError && <p role="alert" className="text-xs text-destructive">{create.error.message}</p>}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:pl-[52px]">
        <LabeledSelect icon="layers" label="Domain" value={domain} options={DOMAINS} onChange={setDomain} />
        <LabeledSelect icon="shield" label="Evaluation Type" value={evaluationType} options={EVAL_TYPES} onChange={setEvaluationType} />
        <button
          onClick={handleRun}
          disabled={create.isPending || !prompt.trim()}
          className="sm:ml-auto flex items-center justify-center gap-2 bg-[#653653] hover:bg-[#7c4165] disabled:opacity-40 text-white px-5 py-2.5 rounded-full text-[13px] font-bold transition-colors flex-shrink-0"
        >
          {create.isPending ? <Loader2 size={14} className="animate-spin" /> : <Icon name="play" size={12} />} Run Evaluation
        </button>
      </div>
    </div>
  );
}