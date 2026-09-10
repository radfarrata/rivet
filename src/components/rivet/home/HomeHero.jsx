import React, { useState } from 'react';
import { Play, PenLine, Paperclip, LayoutTemplate, Loader2, ShieldCheck } from 'lucide-react';
import { useCreateEvaluationTask } from '../useEvaluations';
import { DOMAINS } from '../evalModels';
import HomeHeroHeadline from './HomeHeroHeadline';
import TemplatePicker from './TemplatePicker';
import DocumentUpload from './DocumentUpload';

const TABS = [
  { id: 'new', label: 'New Task', icon: PenLine },
  { id: 'upload', label: 'Upload Document', icon: Paperclip },
  { id: 'template', label: 'From Template', icon: LayoutTemplate },
];

const EVAL_TYPES = [
  { id: 'hybrid', label: 'Human + Automated' },
  { id: 'automated', label: 'Automated only' },
  { id: 'human', label: 'Human only' },
];

const selectCls = 'bg-transparent text-[13px] text-white focus:outline-none';

export default function HomeHero({ currentUser, onNavigate }) {
  const [tab, setTab] = useState('new');
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [criteria, setCriteria] = useState('');
  const [domain, setDomain] = useState('biology');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [evaluationType, setEvaluationType] = useState('hybrid');
  const create = useCreateEvaluationTask();

  const handleRun = () => {
    if (!prompt.trim()) return;
    create.mutate({
      title: (title || prompt).trim().slice(0, 80),
      prompt: prompt.trim(),
      domain,
      difficulty,
      evaluationCriteria: criteria || undefined,
      evaluationType,
      models: ['gpt_5_mini', 'claude-sonnet-5', 'gemini_3_flash'],
      status: 'pending',
      creatorName: currentUser?.full_name || 'You',
    }, {
      onSuccess: () => {
        setPrompt(''); setTitle(''); setCriteria('');
        onNavigate?.('evaluation-lab');
      },
    });
  };

  const applyTemplate = (t) => {
    setTitle(t.label); setPrompt(t.prompt); setCriteria(t.criteria);
    setDomain(t.domain); setDifficulty(t.difficulty); setTab('new');
  };

  return (
    <div className="space-y-5">
      <HomeHeroHeadline />

      <div className="bg-[#12141b] border border-[#1f232e] rounded-2xl p-3 md:p-4 space-y-3">
        <div className="flex items-center gap-1 border-b border-[#1f232e] pb-3">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === id ? 'bg-[#1a1d29] text-white border border-[#2a2e3d]' : 'text-[#8b90a0] hover:text-white'}`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {tab === 'upload' && <DocumentUpload onExtracted={(d) => { setTitle(d.title); setPrompt(d.prompt); setTab('new'); }} />}
        {tab === 'template' && <TemplatePicker onPick={applyTemplate} />}
        {tab === 'new' && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1f232e] border border-[#2a2e3d] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {(currentUser?.full_name || 'You').slice(0, 1).toUpperCase()}
            </div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              placeholder='Describe your task... (e.g. "Given this paper and these constraints, which experimental design is most defensible?")'
              className="flex-1 bg-[#0e1017] border border-[#1f232e] rounded-2xl px-4 py-3 text-sm text-white placeholder-[#6b7080] focus:outline-none focus:border-[#653653]/60 resize-none leading-relaxed"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-[#1f232e] pt-3">
          <label className="flex items-center gap-2 bg-[#0e1017] border border-[#1f232e] rounded-full pl-3 pr-2 py-1.5">
            <span className="text-[10px] font-semibold text-[#6b7080] uppercase tracking-widest">Domain</span>
            <select value={domain} onChange={e => setDomain(e.target.value)} className={selectCls}>
              {DOMAINS.map(d => <option key={d.id} value={d.id} className="bg-[#12141b]">{d.label}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 bg-[#0e1017] border border-[#1f232e] rounded-full pl-3 pr-2 py-1.5">
            <ShieldCheck size={12} className="text-[#6b7080]" />
            <select value={evaluationType} onChange={e => setEvaluationType(e.target.value)} className={selectCls}>
              {EVAL_TYPES.map(t => <option key={t.id} value={t.id} className="bg-[#12141b]">{t.label}</option>)}
            </select>
          </label>
          <button onClick={handleRun} disabled={create.isPending || !prompt.trim()} className="ml-auto flex items-center justify-center gap-2 bg-[#653653] hover:bg-[#7c4165] disabled:opacity-40 text-white px-5 py-2 rounded-full text-[13px] font-bold transition-colors">
            {create.isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}