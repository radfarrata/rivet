import React from 'react';
import { Clock, Plus, BarChart3 } from 'lucide-react';
import { useEvaluationTasks } from '../useEvaluations';
import { domainLabel } from '../evalModels';

function timeAgo(d) {
  const diff = (Date.now() - new Date(d).getTime()) / 60000;
  if (diff < 60) return `${Math.max(1, Math.round(diff))} min ago`;
  if (diff < 1440) return `${Math.round(diff / 60)} hours ago`;
  return `${Math.round(diff / 1440)} days ago`;
}

export default function RecentActivityCard({ onNavigate }) {
  const { data: tasks = [] } = useEvaluationTasks();
  const items = tasks.slice(0, 4);

  return (
    <div className="bg-[#12141b] border border-[#1f232e] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Clock size={15} className="text-[#8b90a0]" /> Recent Activity</h3>
        <button onClick={() => onNavigate?.('evaluation-lab')} className="text-[11px] text-[#8f82ff] hover:underline">See all →</button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-[#8b90a0]">No activity yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map(t => {
            const done = t.status === 'evaluated';
            return (
              <div key={t.id} className="flex items-start gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? 'bg-[#2fd4a7]/10 text-[#2fd4a7]' : 'bg-[#8f82ff]/10 text-[#8f82ff]'}`}>
                  {done ? <BarChart3 size={14} /> : <Plus size={14} />}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-white leading-snug">{done ? 'New evaluation results available' : `${t.creatorName || 'You'} created a new task`}</p>
                  <p className="text-[10px] text-[#6b7080] mt-0.5">{domainLabel(t.domain)} • {timeAgo(t.updated_date || t.created_date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}