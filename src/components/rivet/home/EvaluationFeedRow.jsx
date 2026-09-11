import React from 'react';
import Icon from '@/components/Icon';
import { domainLabel } from '../evalModels';
import SaveTaskButton from '../SaveTaskButton';

const EVAL_LABEL = { hybrid: 'Human + Automated', human: 'Human evaluation', automated: 'Automated' };
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
const BAR = ['bg-[#b06d97]', 'bg-[#4f8cff]', 'bg-[#2fd4a7]', 'bg-[#f5b544]'];

export default function EvaluationFeedRow({ task, results, humanCount, onOpen }) {
  const done = task.status === 'evaluated';

  return (
    <article onClick={() => onOpen?.(task)} className="px-4 py-4 border-b border-[#2f3336] hover:bg-[#080808] transition-colors cursor-pointer">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[12px]">
            <span className="px-2 py-0.5 rounded-md bg-[#2fd4a7]/10 text-[#2fd4a7] font-semibold text-[10px]">{domainLabel(task.domain)}</span>
            <span className="text-[#71767b] truncate">{task.creatorName || 'You'}</span>
            <span className="ml-auto" onClick={e => e.stopPropagation()}><SaveTaskButton task={task} /></span>
          </div>
          <p className="text-[15px] text-white font-bold mt-2 leading-snug">{task.title}</p>
          <p className="text-[13px] text-[#e7e9ea] mt-1 line-clamp-2 leading-relaxed">{task.prompt}</p>
          <div className="flex items-center gap-4 mt-3 text-[11px] text-[#71767b] flex-wrap">
            <span className="flex items-center gap-1.5"><Icon name="calendar" size={11} /> {fmtDate(task.created_date)}</span>
            <span className="flex items-center gap-1.5"><Icon name="layers" size={11} /> {task.models?.length || results.length} models</span>
            <span className="flex items-center gap-1.5"><Icon name="users" size={11} /> {EVAL_LABEL[task.evaluationType] || 'Human evaluation'}{humanCount ? ` (${humanCount})` : ''}</span>
            <span className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${done ? 'bg-[#2fd4a7]/10 text-[#2fd4a7]' : 'bg-[#f5b544]/10 text-[#f5b544]'}`}>
              <Icon name={done ? 'check' : 'clock'} size={10} /> {done ? 'Completed' : task.status === 'running' ? 'Running' : 'Pending'}
            </span>
          </div>
        </div>

        {results.length > 0 && (
          <div className="md:w-[240px] flex-shrink-0 bg-[#16181c] border border-[#2f3336] rounded-xl p-3">
            <p className="text-[11px] text-[#71767b] font-semibold mb-2">Model Performance</p>
            <div className="space-y-2">
              {results.slice(0, 4).map((r, i) => (
                <div key={r.modelId} className="flex items-center gap-2 text-[11px]">
                  <span className="w-16 truncate text-[#e7e9ea]">{r.model}</span>
                  <div className="flex-1 h-1.5 bg-[#2f3336] rounded-full overflow-hidden"><div className={`h-full rounded-full ${BAR[i % BAR.length]}`} style={{ width: `${r.score}%` }} /></div>
                  <span className="w-8 text-right text-[#e7e9ea] font-semibold">{r.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}