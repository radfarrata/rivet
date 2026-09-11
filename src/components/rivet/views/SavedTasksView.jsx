import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useEvaluationTasks, useModelResults } from '../useEvaluations';
import { useHumanEvaluations } from '../useHumanEvaluations';
import { useSavedTasks } from '../useSavedTasks';
import TaskListRow from '../TaskListRow';
import EvaluationTaskDetail from '../EvaluationTaskDetail';
import RivetEmptyState from '../RivetEmptyState';

export default function SavedTasksView({ currentUser }) {
  const { data: tasks = [] } = useEvaluationTasks();
  const { data: results = [] } = useModelResults();
  const { data: humanEvals = [] } = useHumanEvaluations();
  const { data: saved = [], isLoading } = useSavedTasks();
  const [selected, setSelected] = useState(null);

  const savedIds = saved.map(s => s.taskId);
  const list = tasks.filter(t => savedIds.includes(t.id));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Bookmark size={18} className="text-[#b06d97]" /> Saved Tasks</h1>
        <p className="text-[13px] text-[#8b90a0] mt-1">Tasks you bookmarked to run or evaluate later.</p>
      </div>

      <div className="rounded-2xl border border-[#1f232e] bg-[#12141b] overflow-hidden">
        {isLoading ? (
          <RivetEmptyState loading title="Loading your saved tasks…" />
        ) : list.length === 0 ? (
          <RivetEmptyState title="Nothing saved yet" description="Use the bookmark icon on any task to keep it here for later." />
        ) : list.map(t => (
          <TaskListRow
            key={t.id}
            task={t}
            resultCount={results.filter(r => r.taskId === t.id).length}
            evaluatorCount={humanEvals.filter(e => e.taskId === t.id).length}
            onOpen={setSelected}
          />
        ))}
      </div>

      {selected && <EvaluationTaskDetail task={selected} currentUser={currentUser} onClose={() => setSelected(null)} />}
    </div>
  );
}