import React, { useState } from 'react';
import { Play, Paperclip, LayoutTemplate, Loader2, X } from 'lucide-react';
import { useCreateEvaluationTask } from '../useEvaluations';
import { DOMAINS } from '../evalModels';
import TemplatePicker from './TemplatePicker';
import DocumentUpload from './DocumentUpload';

const EVAL_TYPES = [
  { id: 'hybrid', label: 'Human + Automated' },
  { id: 'automated', label: 'Automated only' },
  { id: 'human', label: 'Human only' },
];

// X-style inline composer: avatar + transparent textarea + action row.
export default function HomeHero({ currentUser, onNavigate }) {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('biology');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [evaluationType, setEvaluationType] = useState('hybrid');
  const [mode, setMode] = useState(null); // null | 'upload' | 'template'
  const create = useCreateEvaluationTask();

  const handleRun = () => {
    if (!prompt.trim()) return;
    create.mutate({
      title: (title || prompt).trim().slice(0, 80),
      prompt: prompt.trim(),
      domain,
      difficulty,
      evaluationType,
      models: ['gpt_5_mini', 'claude-sonnet-5', 'gemini_3_flash'],
      status: 'pending',
      creatorName: currentUser?.full_name || 'You',
    }, {
      onSuccess: () => {
        setPrompt(''); setTitle('');
        onNavigate?.('evaluation-lab');
      },
    });
  };

  const applyTemplate = (t) => {
    setTitle(t.label); setPrompt(t.prompt);
    setDomain(t.domain); setDifficulty(t.difficulty);
    setMode(null);
  };

  return (
    <div className="flex gap-3 px-4 py-3 border-b border-[#2f3336]">
      <div className="w-10 h-10 rounded-full bg-[#1f232e] border border-[#2f3336] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
        {(currentUser?.full_name || 'You').slice(0, 1).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={2}
          placeholder='What do you want to evaluate?'
          className="w-full bg-transparent text-[15px] text-white placeholder-[#71767b] focus:outline-none resize-none leading-relaxed pt-2"
        />

        {mode === 'upload' && (
          <div className="mb-2">
            <DocumentUpload onExtracted={(d) => { setTitle(d.title); setPrompt(d.prompt); setMode(null); }} />
            <button onClick={() => setMode(null)} className="text-xs text-[#71767b] hover:text-white mt-1 flex items-center gap-1"><X size={12} /> Cancel</button>
          </div>
        )}
        {mode === 'template' && (
          <div className="mb-2">
            <TemplatePicker onPick={applyTemplate} />
            <button onClick={() => setMode(null)} className="text-xs text-[#71767b] hover:text-white mt-1 flex items-center gap-1"><X size={12} /> Cancel</button>
          </div>
        )}

        <div className="flex items-center gap-1 mt-1 -ml-2">
          <button onClick={() => setMode(mode === 'upload' ? null : 'upload')} title="Upload document" className={`p-2 rounded-full transition-colors ${mode === 'upload' ? 'text-[#b06d97]' : 'text-[#b06d97] hover:bg-[#b06d97]/10'}`}>
            <Paperclip size={18} />
          </button>
          <button onClick={() => setMode(mode === 'template' ? null : 'template')} title="From template" className={`p-2 rounded-full transition-colors ${mode === 'template' ? 'text-[#b06d97]' : 'text-[#b06d97] hover:bg-[#b06d97]/10'}`}>
            <LayoutTemplate size={18} />
          </button>
          <div className="w-px h-6 bg-[#2f3336] mx-1" />
          <label className="flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-[#b06d97]/10 cursor-pointer text-[#b06d97] text-xs font-medium">
            <span className="text-[11px]">{DOMAINS.find(d => d.id === domain)?.label}</span>
            <select value={domain} onChange={e => setDomain(e.target.value)} className="sr-only">
              {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-[#b06d97]/10 cursor-pointer text-[#b06d97] text-xs font-medium">
            <span className="text-[11px]">{EVAL_TYPES.find(t => t.id === evaluationType)?.label}</span>
            <select value={evaluationType} onChange={e => setEvaluationType(e.target.value)} className="sr-only">
              {EVAL_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>
          <button
            onClick={handleRun}
            disabled={create.isPending || !prompt.trim()}
            className="ml-auto flex items-center gap-2 bg-[#653653] hover:bg-[#7c4165] disabled:opacity-40 text-white px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors"
          >
            {create.isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run
          </button>
        </div>
      </div>
    </div>
  );
}