import React from 'react';
import { Sparkles, Users } from 'lucide-react';
import { useEvaluationTasks, useModelResults } from '../useEvaluations';
import { useHumanEvaluations } from '../useHumanEvaluations';
import { visibleTo } from '../evalStats';
import { domainLabel } from '../evalModels';

export default function RecommendedTasksCard({ currentUser, onOpenTask }) {
  const { data: tasks = [] } = useEvaluationTasks();
  const { data: results = [] } = useModelResults();
  const { data: humanEvals = [] } = useHumanEvaluations();
  const uid = currentUser?.id;

  const myDomains = new Set([...tasks.filter(t => t.created_by_id === uid).map(t => t.domain), ...humanEvals.filter(e => e.evaluatorId === uid).map(e => e.domain)]);
  const evaluatedByMe = new Set(humanEvals.filter(e => e.evaluatorId === uid).map(e => e.taskId));
  const humanCount = humanEvals.reduce((a, e) => { a[e.taskId] = (a[e.taskId] || 0) + 1; return a; }, {});

  const recommended = visibleTo(tasks, currentUser)
    .filter(t => t.status === 'evaluated' && t.evaluationType !== 'automated' && !evaluatedByMe.has(t.id) && results.some(r => r.taskId === t.id))
    .sort((a, b) => (myDomains.has(b.domain) - myDomains.has(a.domain)) || ((humanCount[a.id] || 0) - (humanCount[b.id] || 0)))
    .slice(0, 3);

  return (
    <div className="bg-[#16181c] border border-[#2f3336] rounded-2xl p-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1"><Sparkles size={15} className="text-[#b06d97]" /> Recommended for you</h3>
      <p className="text-[11px] text-[#71767b] mb-3">Responses that need human evaluation, matched to your expertise.</p>
      {recommended.length === 0 ? (
        <p className="text-xs text-[#71767b]">Nothing waiting for your review right now.</p>
      ) : (
        <div className="space-y-2.5">
          {recommended.map(t => (
            <div key={t.id} onClick={() => onOpenTask?.(t)} className="cursor-pointer group">
              <p className="text-xs text-white leading-snug group-hover:text-[#b06d97]">{t.title}</p>
              <p className="text-[10px] text-[#71767b] mt-0.5 flex items-center gap-2">
                <span className={myDomains.has(t.domain) ? 'text-[#b06d97] font-semibold' : ''}>{domainLabel(t.domain)}</span>
                <span className="flex items-center gap-1"><Users size={10} /> {humanCount[t.id] || 0} human evaluations</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}