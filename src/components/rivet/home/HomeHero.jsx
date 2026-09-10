import React, { useState } from 'react';
import { Sparkles, Play, PenLine, Loader2 } from 'lucide-react';
import { useCreateEvaluationTask } from '../useEvaluations';
import { DOMAINS } from '../evalModels';

export default function HomeHero({ currentUser, onNavigate }) {
  const [prompt, setPrompt] = useState('');
  const [domain, setDomain] = useState('biology');
  const create = useCreateEvaluationTask();

  const handleRun = () => {
    if (!prompt.trim()) return;
    create.mutate({
      title: prompt.trim().slice(0, 80),
      prompt: prompt.trim(),
      domain,
      difficulty: 'intermediate',
      models: ['gpt_5_mini', 'claude-sonnet-5', 'gemini_3_flash'],
      status: 'pending',
      creatorName: currentUser?.full_name || 'You',
    }, { onSuccess: () => { setPrompt(''); onNavigate?.('evaluation-lab'); } });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-6">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
            Better answers through <span className="text-[#b06d97]">real evaluation.</span>
          </h1>
          <p className="text-sm md:text-base text-[#8b90a0] mt-3 leading-relaxed">
            Rivet lets you bring real-world tasks, test multiple AI models, and see how they perform — with transparent, human-verified evaluation.
          </p>
        </div>
        <div className="hidden md:flex w-36 h-36 flex-shrink-0 items-center justify-center relative">
          <div className="absolute inset-0 rounded-full bg-[#653653]/20 blur-2xl" />
          <div className="absolute inset-3 rounded-full border border-[#653653]/30" />
          <div className="absolute inset-8 rounded-full border border-[#653653]/20 rotate-45 scale-x-125" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#b06d97] to-[#4a2740] flex items-center justify-center shadow-[0_0_40px_rgba(101,54,83,0.7)] relative">
            <Sparkles size={26} className="text-white" />
          </div>
        </div>
      </div>

      <div className="bg-[#12141b] border border-[#1f232e] rounded-2xl p-3 md:p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1d29] text-white border border-[#2a2e3d]"><PenLine size={13} /> New Task</span>
        </div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          placeholder='Describe your task... (e.g. "Given this paper and these constraints, which experimental design is most defensible?")'
          className="w-full bg-[#0e1017] border border-[#1f232e] rounded-xl px-4 py-3 text-sm text-white placeholder-[#6b7080] focus:outline-none focus:border-[#653653]/60 resize-none"
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="flex-1 flex items-center gap-2 bg-[#0e1017] border border-[#1f232e] rounded-xl px-3 py-2">
            <span className="text-[10px] text-[#6b7080] uppercase tracking-wide">Domain</span>
            <select value={domain} onChange={e => setDomain(e.target.value)} className="flex-1 bg-transparent text-sm text-white focus:outline-none">
              {DOMAINS.map(d => <option key={d.id} value={d.id} className="bg-[#12141b]">{d.label}</option>)}
            </select>
          </label>
          <button onClick={handleRun} disabled={create.isPending || !prompt.trim()} className="flex items-center justify-center gap-2 bg-[#653653] hover:bg-[#7c4165] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(101,54,83,0.5)]">
            {create.isPending ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />} Run Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}