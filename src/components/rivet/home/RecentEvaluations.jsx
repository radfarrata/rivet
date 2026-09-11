import React, { useState } from 'react';
import { useEvaluationTasks, useModelResults } from '../useEvaluations';
import { useHumanEvaluations } from '../useHumanEvaluations';
import { visibleTo } from '../evalStats';
import FeedTabs from './FeedTabs';
import EvaluationFeedRow from './EvaluationFeedRow';

const TABS = [
  { id: 'foryou', label: 'For you' },
  { id: 'completed', label: 'Completed' },
  { id: 'yours', label: 'Your tasks' },
];

export default function RecentEvaluations({ currentUser, onNavigate, onOpenTask }) {
  const { data: tasks = [] } = useEvaluationTasks();
  const { data: results = [] } = useModelResults();
  const { data: humanEvals = [] } = useHumanEvaluations();
  const [tab, setTab] = useState('foryou');

  const visible = visibleTo(tasks, currentUser);
  const sorted = [...visible].sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
  const feed = sorted.filter(t =>
    tab === 'completed' ? t.status === 'evaluated' :
    tab === 'yours' ? t.created_by_id === currentUser?.id : true
  ).slice(0, 12);

  return (
    <div>
      <FeedTabs tabs={TABS} active={tab} onChange={setTab} />
      {feed.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#71767b] border-b border-[#2f3336]">
          Nothing here yet.{' '}
          <button onClick={() => onNavigate?.('evaluation-lab')} className="text-[#b06d97] hover:underline">Create an evaluation task</button>
        </div>
      ) : feed.map(task => (
        <EvaluationFeedRow
          key={task.id}
          task={task}
          results={results.filter(r => r.taskId === task.id).sort((a, b) => b.score - a.score)}
          humanCount={humanEvals.filter(e => e.taskId === task.id).length}
          onOpen={onOpenTask}
        />
      ))}
    </div>
  );
}