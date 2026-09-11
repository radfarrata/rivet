import React from 'react';
import { Layers, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { domainLabel } from '../evalModels';
import SaveTaskButton from '../SaveTaskButton';

const timeShort = (d) => {
  if (!d) return 'now';
  const m = (Date.now() - new Date(d).getTime()) / 60000;
  if (m < 60) return `${Math.max(1, Math.round(m))}m`;
  if (m < 1440) return `${Math.round(m / 60)}h`;
  return `${Math.round(m / 1440)}d`;
};

// X-style feed row: avatar gutter, inline meta line, divider. No cards.
export default function EvaluationFeedRow({ task, results, humanCount, onOpen }) {
  const done = task.status === 'evaluated';
  const top = results[0];

  return (
    <article onClick={() => onOpen?.(task)} className="flex gap-3 px-4 py-3 border-b border-[#2f3336] hover:bg-[#080808] transition-colors cursor-pointer">
      <div className="w-10 h-10 rounded-full bg-[#1f232e] border border-[#2f3336] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
        {(task.creatorName || 'You').slice(0, 1).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[13px] flex-wrap">
          <span className="font-bold text-white truncate">{task.creatorName || 'You'}</span>
          <span className="text-[#71767b] truncate">@{(task.creatorName || 'you').toLowerCase().replace(/\s+/g, '')}</span>
          <span className="text-[#71767b]">· {timeShort(task.created_date)}</span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-md bg-[#b06d97]/10 text-[#b06d97] font-semibold">{domainLabel(task.domain)}</span>
        </div>
        <p className="text-[15px] text-white font-semibold mt-0.5 leading-snug">{task.title}</p>
        <p className="text-[14px] text-[#e7e9ea] mt-0.5 line-clamp-2 leading-relaxed">{task.prompt}</p>

        {results.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {results.slice(0, 3).map(r => (
              <div key={r.modelId} className="flex items-center gap-2 text-[12px]">
                <span className="w-24 truncate text-[#e7e9ea]">{r.model}</span>
                <div className="flex-1 h-2 bg-[#2f3336] rounded-full overflow-hidden"><div className="h-full rounded-full bg-[#b06d97]" style={{ width: `${r.score}%` }} /></div>
                <span className="w-8 text-right text-[#e7e9ea] font-semibold">{r.score}%</span>
              </div>
            ))}
            {top && <p className="text-[11px] text-[#71767b] mt-1">Best: {top.model} at {top.score}%</p>}
          </div>
        )}

        <div className="flex items-center gap-6 mt-3 text-[#71767b] text-[13px]">
          <span className="flex items-center gap-1.5 hover:text-[#b06d97] transition-colors"><Layers size={15} /> {results.length}</span>
          <span className="flex items-center gap-1.5 hover:text-[#b06d97] transition-colors"><MessageSquare size={15} /> {humanCount}</span>
          <span className={`flex items-center gap-1.5 ${done ? 'text-[#2fd4a7]' : 'text-[#f5b544]'}`}>
            {done ? <CheckCircle2 size={15} /> : <Clock size={15} />}
          </span>
          <span className="ml-auto"><SaveTaskButton task={task} /></span>
        </div>
      </div>
    </article>
  );
}