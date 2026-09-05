import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function PollBlock({ post, currentUser, onVote, variant = 'dark' }) {
  const poll = post.poll;
  if (!poll || !poll.options || poll.options.length === 0) return null;

  const total = poll.options.reduce((s, o) => s + (o.voterIds || []).length, 0);
  const voted = poll.options.some(o => (o.voterIds || []).includes(currentUser?.id));
  const dark = variant === 'dark';

  const card = 'border-[#e4e6eb] bg-[#f0f2f5]';
  const meta = 'text-[#65676b]';
  const qText = 'text-[#050505]';
  const optBorder = 'border-[#e4e6eb]';
  const optText = 'text-[#3a3b3c]';
  const votedText = 'text-[#050505]';

  return (
    <div className={`rounded-xl border p-4 mb-3 ${card}`}>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={14} className={meta} />
        <span className={`text-xs font-semibold uppercase tracking-wide ${meta}`}>Poll</span>
        <span className={`text-xs ml-auto ${meta}`}>{total} votes</span>
      </div>
      <p className={`text-sm font-bold mb-3 ${qText}`}>{poll.question}</p>
      <div className="space-y-2">
        {poll.options.map(o => {
          const count = (o.voterIds || []).length;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const youVoted = (o.voterIds || []).includes(currentUser?.id);
          return (
            <button
              key={o.id}
              disabled={voted || !onVote}
              onClick={(e) => { e.stopPropagation(); onVote?.(o.id); }}
              className={`relative w-full text-left rounded-lg border overflow-hidden px-3 py-2 text-sm transition-colors ${youVoted ? 'border-[#1877f2] bg-[#1877f2]/5' : optBorder} ${voted ? 'cursor-default' : 'hover:border-[#1877f2] cursor-pointer'}`}
            >
              {voted && <div className="absolute inset-y-0 left-0 bg-[#1877f2]/15" style={{ width: `${pct}%` }} />}
              <div className="relative flex items-center justify-between">
                <span className={`font-medium ${voted ? votedText : optText}`}>{o.text}{youVoted && ' ✓'}</span>
                {voted && <span className="text-xs font-bold text-[#1877f2]">{pct}%</span>}
              </div>
            </button>
          );
        })}
      </div>
      {!voted && onVote && <p className={`text-[10px] mt-2 ${meta}`}>Tap an option to vote.</p>}
    </div>
  );
}