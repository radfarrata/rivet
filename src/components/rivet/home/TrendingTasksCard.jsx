import React from 'react';
import { Flame, Users } from 'lucide-react';
import { useEvaluationTasks, useModelResults } from '../useEvaluations';
import { domainLabel } from '../evalModels';
import { visibleTo } from '../evalStats';

const BADGE = {
  biology: 'bg-[#2fd4a7]/10 text-[#2fd4a7]', chemistry: 'bg-[#f5b544]/10 text-[#f5b544]', physics: 'bg-[#4f8cff]/10 text-[#4f8cff]',
  coding: 'bg-[#b06d97]/10 text-[#b06d97]', reasoning: 'bg-[#ff7ab6]/10 text-[#ff7ab6]', safety: 'bg-[#ff6b6b]/10 text-[#ff6b6b]',
};

export default function TrendingTasksCard({ currentUser, onNavigate, onOpenTask }) {
  const { data: allTasks = [] } = useEvaluationTasks();
  const tasks = visibleTo(allTasks, currentUser);
  const { data: results = [] } = useModelResults();
  const counts = results.reduce((acc, r) => { acc[r.taskId] = (acc[r.taskId] || 0) + 1; return acc; }, {});
  const trending = [...tasks].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0)).slice(0, 5);

  return (
    <div className="bg-[#12141b] border border-[#1f232e] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Flame size={15} className="text-[#f5b544]" /> Trending Tasks</h3>
        <button onClick={() => onNavigate?.('evaluation-lab')} className="text-[11px] text-[#b06d97] hover:underline">See all →</button>
      </div>
      {trending.length === 0 ? (
        <p className="text-xs text-[#8b90a0]">No tasks yet.</p>
      ) : (
        <div className="space-y-3">
          {trending.map(t => (
            <div key={t.id} onClick={() => onOpenTask?.(t)} className="flex items-start gap-2.5 cursor-pointer group">
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold flex-shrink-0 mt-0.5 ${BADGE[t.domain] || 'bg-[#1f232e] text-[#b8bcc8]'}`}>{domainLabel(t.domain)}</span>
              <div className="min-w-0">
                <p className="text-xs text-white leading-snug group-hover:text-[#b06d97] transition-colors">{t.title}</p>
                <p className="text-[10px] text-[#6b7080] mt-0.5 flex items-center gap-1"><Users size={10} /> {counts[t.id] || 0} evaluations</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}