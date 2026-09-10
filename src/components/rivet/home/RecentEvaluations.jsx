import React from 'react';
import { ChevronRight, Calendar, Layers, CheckCircle2 } from 'lucide-react';
import { useEvaluationTasks, useModelResults } from '../useEvaluations';
import { domainLabel } from '../evalModels';

const BAR_COLORS = ['bg-[#8f82ff]', 'bg-[#4f8cff]', 'bg-[#2fd4a7]', 'bg-[#f5b544]'];

export default function RecentEvaluations({ onNavigate, onOpenTask }) {
  const { data: tasks = [] } = useEvaluationTasks();
  const { data: results = [] } = useModelResults();
  const recent = tasks.filter(t => t.status === 'evaluated').slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white">Recent Evaluations</h2>
        <button onClick={() => onNavigate?.('evaluation-lab')} className="text-xs text-[#8f82ff] hover:underline">View all →</button>
      </div>
      {recent.length === 0 ? (
        <div className="bg-[#12141b] border border-[#1f232e] rounded-2xl p-8 text-center text-sm text-[#8b90a0]">No completed evaluations yet. Run your first task above.</div>
      ) : recent.map(task => {
        const rs = results.filter(r => r.taskId === task.id).sort((a, b) => b.score - a.score);
        return (
          <div key={task.id} onClick={() => onOpenTask?.(task)} className="bg-[#12141b] border border-[#1f232e] rounded-2xl p-4 md:p-5 grid grid-cols-1 lg:grid-cols-[1fr_260px_auto] gap-4 items-center cursor-pointer hover:border-[#6d5dfc]/40 transition-colors">
            <div className="min-w-0">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#2fd4a7]/10 text-[#2fd4a7] font-semibold">{domainLabel(task.domain)}</span>
              <h3 className="text-sm font-bold text-white mt-2 leading-snug">{task.title}</h3>
              <p className="text-xs text-[#8b90a0] mt-1 line-clamp-2">{task.prompt}</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-[#6b7080] flex-wrap">
                <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(task.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Layers size={11} /> {rs.length} models</span>
                <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2fd4a7]/10 text-[#2fd4a7] font-semibold"><CheckCircle2 size={11} /> Completed</span>
              </div>
            </div>
            <div className="bg-[#0e1017] border border-[#1f232e] rounded-xl p-3 space-y-2">
              <p className="text-[10px] text-[#6b7080] uppercase tracking-wide">Model Performance</p>
              {rs.map((r, i) => (
                <div key={r.modelId} className="flex items-center gap-2 text-xs">
                  <span className="w-20 truncate text-[#b8bcc8]">{r.model}</span>
                  <div className="flex-1 h-1.5 bg-[#1f232e] rounded-full overflow-hidden"><div className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} style={{ width: `${r.score}%` }} /></div>
                  <span className="w-8 text-right text-[#b8bcc8] font-semibold">{r.score}%</span>
                </div>
              ))}
            </div>
            <ChevronRight size={18} className="text-[#6b7080] hidden lg:block" />
          </div>
        );
      })}
    </div>
  );
}