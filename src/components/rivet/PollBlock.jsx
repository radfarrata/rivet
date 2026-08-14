import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function PollBlock({ post, currentUser, onVote }) {
  const poll = post.poll;
  if (!poll || !poll.options || poll.options.length === 0) return null;

  const total = poll.options.reduce((s, o) => s + (o.voterIds || []).length, 0);
  const voted = poll.options.some(o => (o.voterIds || []).includes(currentUser?.id));

  return (
    <div className="rounded-xl border border-gray-200 p-4 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={14} className="text-gray-400" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Poll</span>
        <span className="text-xs text-gray-400 ml-auto">{total} votes</span>
      </div>
      <p className="text-sm font-bold text-gray-900 mb-3">{poll.question}</p>
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
              className={`relative w-full text-left rounded-lg border overflow-hidden px-3 py-2 text-sm transition-colors ${
                youVoted ? 'border-[#1d9bf0] bg-[#1d9bf0]/5' : 'border-gray-200'
              } ${voted ? 'cursor-default' : 'hover:border-[#1d9bf0] cursor-pointer'}`}
            >
              {voted && <div className="absolute inset-y-0 left-0 bg-[#1d9bf0]/10" style={{ width: `${pct}%` }} />}
              <div className="relative flex items-center justify-between">
                <span className={`font-medium ${voted ? 'text-gray-900' : 'text-gray-700'}`}>{o.text}{youVoted && ' ✓'}</span>
                {voted && <span className="text-xs font-bold text-gray-600">{pct}%</span>}
              </div>
            </button>
          );
        })}
      </div>
      {!voted && onVote && <p className="text-[10px] text-gray-400 mt-2">Tap an option to vote.</p>}
    </div>
  );
}