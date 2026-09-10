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
        <div className="flex items-center gap-2 text-xs font-semibold border-t border-[#1f232e] pt-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1d29] text-white border border-[#2a2e3d]"><PenLine size={13} /> New Task</span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#8b90a0]"><Sparkles size={13} /> Multi-model</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="flex-1 flex items-center gap-2 bg-[#0e1017] border border-[#1f232e] rounded-full px-4 py-2">
            <span className="text-[10px] text-[#6b7080] uppercase tracking-wide">Domain</span>
            <select value={domain} onChange={e => setDomain(e.target.value)} className="flex-1 bg-transparent text-sm text-white focus:outline-none">
              {DOMAINS.map(d => <option key={d.id} value={d.id} className="bg-[#12141b]">{d.label}</option>)}
            </select>
          </label>
          <button onClick={handleRun} disabled={create.isPending || !prompt.trim()} className="flex items-center justify-center gap-2 bg-[#653653] hover:bg-[#7c4165] disabled:opacity-50 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors shadow-[0_0_20px_rgba(101,54,83,0.5)]">
            {create.isPending ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />} Run Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}