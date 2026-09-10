import React from 'react';
import { Layers, CheckCircle2, Clock, MessageSquare, BarChart3 } from 'lucide-react';
import { domainLabel } from '../evalModels';

const timeShort = (d) => {
  const m = (Date.now() - new Date(d).getTime()) / 60000;
  if (m < 60) return `${Math.max(1, Math.round(m))}m`;
  if (m < 1440) return `${Math.round(m / 60)}h`;
  return `${Math.round(m / 1440)}d`;
};

// X-style feed row: avatar gutter, inline meta line, divider instead of a card.
export default function EvaluationFeedRow({ task, results, humanCount, onOpen }) {
  const done = task.status === 'evaluated';
  const top = results[0];

  return (
    <article onClick={() => onOpen?.(task)} className="flex gap-3 px-4 md:px-6 -mx-4 md:-mx-6 py-4 border-b border-[#1f232e] hover:bg-[#101219] transition-colors cursor-pointer">
      <div className="w-10 h-10 rounded-full bg-[#1f232e] border border-[#2a2e3d] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
        {(task.creatorName || 'You').slice(0, 1).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm flex-wrap">
          <span className="font-bold text-white truncate">{task.creatorName || 'You'}</span>
          <span className="text-[#6b7080] text-xs">· {timeShort(task.created_date)}</span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-md bg-[#b06d97]/10 text-[#b06d97] font-semibold">{domainLabel(task.domain)}</span>
        </div>
        <p className="text-sm text-white font-semibold mt-0.5 leading-snug">{task.title}</p>
        <p className="text-sm text-[#8b90a0] mt-0.5 line-clamp-2 leading-relaxed">{task.prompt}</p>

        {results.length > 0 && (
          <div className="mt-3 rounded-2xl border border-[#1f232e] bg-[#12141b] overflow-hidden">
            <div className="px-3 py-2 border-b border-[#1f232e] flex items-center gap-2">
              <BarChart3 size={13} className="text-[#b06d97]" />
              <span className="text-[11px] font-semibold text-white">Model comparison</span>
              {top && <span className="ml-auto text-[11px] text-[#8b90a0]">Best: <span className="text-white font-semibold">{top.model} {top.score}%</span></span>}
            </div>
            <div className="p-3 space-y-2">
              {results.slice(0, 4).map(r => (
                <div key={r.modelId} className="flex items-center gap-2 text-xs">
                  <span className="w-20 truncate text-[#b8bcc8]">{r.model}</span>
                  <div className="flex-1 h-1.5 bg-[#1f232e] rounded-full overflow-hidden"><div className="h-full rounded-full bg-[#b06d97]" style={{ width: `${r.score}%` }} /></div>
                  <span className="w-8 text-right text-[#b8bcc8] font-semibold">{r.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 mt-2.5 text-[#6b7080] text-xs">
          <span className="flex items-center gap-1.5 hover:text-[#b06d97] transition-colors"><Layers size={14} /> {results.length} models</span>
          <span className="flex items-center gap-1.5 hover:text-[#b06d97] transition-colors"><MessageSquare size={14} /> {humanCount} evaluations</span>
          <span className={`flex items-center gap-1.5 font-semibold ${done ? 'text-[#2fd4a7]' : 'text-[#f5b544]'}`}>
            {done ? <><CheckCircle2 size={14} /> Completed</> : <><Clock size={14} /> {task.status}</>}
          </span>
        </div>
      </div>
    </article>
  );
}