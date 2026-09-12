import React from 'react';
import Icon from '@/components/Icon';
import { domainLabel } from '../evalModels';
import ModelScoreBars from './ModelScoreBars';
import VerdictBadges from './VerdictBadges';
import SaveTaskButton from '../SaveTaskButton';

const fmt = (d) => {
  if (!d) return '';
  const diff = (Date.now() - new Date(d)) / 36e5;
  if (diff < 1) return `${Math.max(1, Math.round(diff * 60))}m`;
  if (diff < 24) return `${Math.round(diff)}h`;
  return `${Math.round(diff / 24)}d`;
};

/** One verdict: the claim, the ranking that backs it, and the way to disagree. */
export default function VerdictRow({ verdict, onOpen, onDisagree }) {
  const { task, winner, margin, ranked, humanCount, confidence } = verdict;

  return (
    <article
      onClick={() => onOpen(task)}
      className="px-4 py-4 border-b border-[#2f3336] hover:bg-[#16181c] transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2 flex-wrap text-[12px] text-[#71767b]">
        <span className="px-2 py-0.5 rounded-md bg-[#2f3336] text-[#e7e9ea] text-[10px] font-semibold">{domainLabel(task.domain)}</span>
        <span className="font-semibold text-[#e7e9ea]">{task.creatorName || 'Anonymous'}</span>
        <span>· {fmt(verdict.date)}</span>
        <span className="ml-auto flex items-center gap-3" onClick={e => e.stopPropagation()}>
          <span className="text-[11px]">{humanCount} review{humanCount === 1 ? '' : 's'} · one task, not a ranking</span>
          <SaveTaskButton task={task} />
        </span>
      </div>

      <h3 className="text-[15px] font-bold text-white mt-2 leading-snug">{task.title}</h3>

      <p className="text-[14px] text-[#e7e9ea] mt-1.5 leading-snug">
        <span className="font-bold text-white">{winner.model}</span> scored higher on this task
        {margin !== null ? <> by <span className="font-mono font-bold text-[#b06d97]">{margin} pts</span></> : null}
        {ranked.length > 1 ? <> over {ranked[1].model}</> : null}.
      </p>

      {winner.summary && (
        <blockquote className="mt-2 pl-3 border-l-2 border-[#653653] text-[13px] text-[#71767b] leading-relaxed line-clamp-2">
          {winner.summary}
        </blockquote>
      )}

      <p className="text-[11px] text-muted-foreground mt-2">{ranked.some(r => r.evidenceStatus !== 'complete') ? 'Contains legacy / incomplete provenance; excluded from official rankings.' : `${winner.methodologyVersion} · exploratory task result · domain confidence unavailable from one task`}</p>
      <VerdictBadges verdict={{ ...verdict, upset: false }} />
      <ModelScoreBars ranked={ranked} />

      <div className="flex items-center gap-2 mt-3" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onDisagree(task)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#2f3336] text-[12px] font-semibold text-[#e7e9ea] hover:border-[#b06d97] hover:text-white transition-colors"
        >
          <Icon name="alert" size={11} /> Disagree
        </button>
        <button
          onClick={() => onOpen(task)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-[#71767b] hover:text-white transition-colors"
        >
          <Icon name="file" size={11} /> See the evidence
        </button>
      </div>
    </article>
  );
}