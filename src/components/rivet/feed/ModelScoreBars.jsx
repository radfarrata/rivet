import React from 'react';
import EvidenceLink from '@/components/rivet/integrity/EvidenceLink';

const BAR = ['bg-[#b06d97]', 'bg-[#4f8cff]', 'bg-[#2fd4a7]', 'bg-[#f5b544]', 'bg-[#71767b]'];

/** Head-to-head bars for every model that ran a task. */
export default function ModelScoreBars({ ranked }) {
  const max = Math.max(...ranked.map(r => r.score), 1);
  return (
    <div className="space-y-1.5 mt-3">
      {ranked.slice(0, 5).map((r, i) => (
        <div key={r.resultId} className="flex items-center gap-2.5">
          <span className={`text-[11px] w-28 truncate ${i === 0 ? 'text-white font-semibold' : 'text-[#71767b]'}`}>{r.model}</span>
          <span className="flex-1 h-1.5 rounded-full bg-[#2f3336] overflow-hidden">
            <span className={`block h-full rounded-full ${BAR[i % BAR.length]}`} style={{ width: `${(r.score / max) * 100}%` }} />
          </span>
          <span className={`text-[11px] font-mono w-8 text-right ${i === 0 ? 'text-white font-semibold' : 'text-[#71767b]'}`}>{Math.round(r.score)}</span>
          <span className="dark"><EvidenceLink resultId={r.resultId} legacy={r.evidenceStatus !== 'complete'} /></span>
        </div>
      ))}
    </div>
  );
}