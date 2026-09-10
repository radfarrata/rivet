import React from 'react';
import { Award } from 'lucide-react';
import { useEvaluationTasks, useModelResults } from '../useEvaluations';
import { useHumanEvaluations } from '../useHumanEvaluations';

const LEVELS = [[50, 'Core Contributor'], [20, 'Expert Evaluator'], [5, 'Contributor'], [0, 'Newcomer']];

export default function YourImpactCard({ currentUser, onNavigate }) {
  const { data: tasks = [] } = useEvaluationTasks();
  const { data: results = [] } = useModelResults();
  const { data: humanEvals = [] } = useHumanEvaluations();
  const uid = currentUser?.id;

  const myTasks = tasks.filter(t => t.created_by_id === uid);
  const myTaskIds = new Set(myTasks.map(t => t.id));
  const myEvals = humanEvals.filter(e => e.evaluatorId === uid);
  const timesEvaluated = results.filter(r => myTaskIds.has(r.taskId)).length + humanEvals.filter(e => myTaskIds.has(e.taskId)).length;
  const failures = myEvals.filter(e => e.verdict === 'fail').length;
  const total = myTasks.length + myEvals.length;
  const level = LEVELS.find(([min]) => total >= min)[1];

  const stats = [
    ['Tasks created', myTasks.length], ['Evaluations contributed', myEvals.length],
    ['Times your tasks were evaluated', timesEvaluated], ['Model failures identified', failures],
  ];

  return (
    <div className="bg-gradient-to-br from-[#2a1524] to-[#12141b] border border-[#653653]/50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Award size={15} className="text-[#b06d97]" /> Your Impact</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#653653]/40 text-[#d9b8cd] font-semibold">{level}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-[#0e1017]/60 rounded-xl p-2.5">
            <p className="text-lg font-bold text-white leading-none">{value}</p>
            <p className="text-[10px] text-[#8b90a0] mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>
      {total === 0 && <button onClick={() => onNavigate?.('evaluation-lab')} className="mt-3 text-[11px] text-[#b06d97] hover:underline">Create a task or evaluate a response to start building your record →</button>}
    </div>
  );
}