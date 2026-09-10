import React from 'react';
import { ChevronDown, Trophy, Bot, Users } from 'lucide-react';
import HumanEvalForm from './HumanEvalForm';
import { FAILURE_LABELS } from './evalStats';

const Block = ({ label, color = 'text-[#8b90a0]', children }) => (
  <div><p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${color}`}>{label}</p><p className="text-sm text-[#d4d7e0] leading-relaxed">{children}</p></div>
);

export default function ModelResultCard({ task, result, humanEvals, isBest, open, onToggle, currentUser }) {
  const mine = humanEvals.some(e => e.evaluatorId === currentUser?.id);
  const h = result.human;

  return (
    <div className="rounded-xl border border-[#1f232e] bg-[#12141b] overflow-hidden">
      <button onClick={onToggle} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[#151823] transition-colors">
        {isBest && <Trophy size={15} className="text-[#f5b544] flex-shrink-0" />}
        <span className="text-sm font-semibold text-white w-24 truncate">{result.model}</span>
        <div className="flex-1 h-2 bg-[#1f232e] rounded-full overflow-hidden min-w-[50px]"><div className="h-full bg-[#8f82ff] rounded-full" style={{ width: `${result.blended}%` }} /></div>
        <span className="text-sm font-bold text-white w-10 text-right">{result.blended}%</span>
        <ChevronDown size={16} className={`text-[#6b7080] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className="px-4 pb-2 -mt-1 flex items-center gap-3 text-[10px] text-[#6b7080]">
        <span className="flex items-center gap-1"><Bot size={10} /> Automated {result.score}%</span>
        <span className="flex items-center gap-1"><Users size={10} /> {h ? `Human ${Math.round(h.avg)}% · ${h.n} evaluator${h.n === 1 ? '' : 's'} · ${h.agreement}% agreement` : 'No human evaluations yet'}</span>
      </div>
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3 border-t border-[#1f232e]">
          <Block label="Why this score (automated judge)">{result.summary || '—'}</Block>
          {result.strengths && <Block label="Strengths" color="text-[#2fd4a7]">{result.strengths}</Block>}
          {result.weaknesses && <Block label="Weaknesses" color="text-[#f5b544]">{result.weaknesses}</Block>}
          {result.failureModes && <Block label="Failure modes" color="text-[#ff6b6b]">{result.failureModes}</Block>}
          <div>
            <p className="text-[10px] font-semibold text-[#8b90a0] uppercase tracking-wide mb-1">Full response · {result.model}</p>
            <pre className="text-xs text-[#d4d7e0] whitespace-pre-wrap bg-[#0e1017] border border-[#1f232e] rounded-lg p-3 max-h-56 overflow-y-auto font-sans">{result.rawResponse}</pre>
          </div>
          {humanEvals.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-[#8b90a0] uppercase tracking-wide">Human evaluations</p>
              {humanEvals.map(e => (
                <div key={e.id} className="bg-[#0e1017] border border-[#1f232e] rounded-lg px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{e.evaluatorName}</span>
                    <span className="text-[#b8bcc8]">{e.score}%</span>
                    <span className={`px-1.5 py-0.5 rounded font-semibold ${e.verdict === 'pass' ? 'bg-[#2fd4a7]/15 text-[#2fd4a7]' : e.verdict === 'partial' ? 'bg-[#f5b544]/15 text-[#f5b544]' : 'bg-[#ff6b6b]/15 text-[#ff6b6b]'}`}>{e.verdict}</span>
                    {e.failureCategory && e.failureCategory !== 'none' && <span className="text-[#ff6b6b]">{FAILURE_LABELS[e.failureCategory]}</span>}
                  </div>
                  {e.notes && <p className="text-[#8b90a0] mt-1">{e.notes}</p>}
                </div>
              ))}
            </div>
          )}
          {task.evaluationType !== 'automated' && <HumanEvalForm task={task} result={result} currentUser={currentUser} alreadyEvaluated={mine} />}
        </div>
      )}
    </div>
  );
}