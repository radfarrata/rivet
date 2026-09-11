import React, { useState } from 'react';
import { Search, Compass } from 'lucide-react';
import { useEvaluationTasks, useModelResults } from '../useEvaluations';
import { useHumanEvaluations } from '../useHumanEvaluations';
import { visibleTo } from '../evalStats';
import { DOMAINS } from '../evalModels';
import TaskListRow from '../TaskListRow';
import EvaluationTaskDetail from '../EvaluationTaskDetail';
import RivetEmptyState from '../RivetEmptyState';

export default function ExploreTasksView({ currentUser }) {
  const { data: tasks = [] } = useEvaluationTasks();
  const { data: results = [] } = useModelResults();
  const { data: humanEvals = [] } = useHumanEvaluations();
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('all');
  const [selected, setSelected] = useState(null);

  const q = query.toLowerCase();
  const list = visibleTo(tasks, currentUser).filter(t =>
    (domain === 'all' || t.domain === domain) &&
    (!q || `${t.title} ${t.prompt}`.toLowerCase().includes(q))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Compass size={18} className="text-[#b06d97]" /> Explore Tasks</h1>
        <p className="text-[13px] text-[#8b90a0] mt-1">Browse every public evaluation task in the community and save the ones you want to work on.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7080]" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks..." className="w-full bg-[#12141b] border border-[#1f232e] rounded-full py-2.5 pl-9 pr-3 text-sm text-white placeholder-[#6b7080] focus:outline-none focus:border-[#653653]/60" />
        </div>
        <select value={domain} onChange={e => setDomain(e.target.value)} className="bg-[#12141b] border border-[#1f232e] rounded-full px-4 py-2.5 text-sm text-white focus:outline-none">
          <option value="all" className="bg-[#12141b]">All domains</option>
          {DOMAINS.map(d => <option key={d.id} value={d.id} className="bg-[#12141b]">{d.label}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-[#1f232e] bg-[#12141b] overflow-hidden">
        {list.length === 0 ? (
          <RivetEmptyState title="No tasks match that search" description="Try a different keyword or switch the domain filter." />
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