import React, { useState } from 'react';
import { Sparkles, Play, Loader2 } from 'lucide-react';
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
      {/* Facebook-style composer card */}
      <div className="bg-[#12141b] border border-[#1f232e] rounded-2xl p-3 md:p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1f232e] border border-[#2a2e3d] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {(currentUser?.full_name || 'You').slice(0, 1).toUpperCase()}
          </div>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={2}
            placeholder={`What should the models be tested on, ${(currentUser?.full_name || 'there').split(' ')[0]}?`}
            className="flex-1 bg-[#0e1017] border border-[#1f232e] rounded-2xl px-4 py-3 text-sm text-white placeholder-[#6b7080] focus:outline-none focus:border-[#653653]/60 resize-none"
          />
        </div>
        <div className="flex items-center gap-2 border-t border-[#1f232e] pt-3">
          <label className="flex items-center gap-2 bg-[#0e1017] border border-[#1f232e] rounded-full pl-3 pr-2 py-1.5">
            <span className="text-[10px] font-semibold text-[#6b7080] uppercase tracking-widest">Domain</span>
            <select value={domain} onChange={e => setDomain(e.target.value)} className="bg-transparent text-[13px] text-white focus:outline-none">
              {DOMAINS.map(d => <option key={d.id} value={d.id} className="bg-[#12141b]">{d.label}</option>)}
            </select>
          </label>
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-[#6b7080]"><Sparkles size={12} /> 3 models</span>
          <button onClick={handleRun} disabled={create.isPending || !prompt.trim()} className="ml-auto flex items-center justify-center gap-2 bg-[#653653] hover:bg-[#7c4165] disabled:opacity-40 text-white px-5 py-2 rounded-full text-[13px] font-bold transition-colors">
            {create.isPending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run evaluation
          </button>
        </div>
      </div>
    </div>
  );
}