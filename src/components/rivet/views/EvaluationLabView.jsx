import React, { useState } from 'react';
import { useEvaluationTasks } from '../useEvaluations';
import EvaluationTaskForm from '../EvaluationTaskForm';
import EvaluationTaskDetail from '../EvaluationTaskDetail';
import { domainLabel, modelLabel } from '../evalModels';
import { FlaskConical, ChevronRight } from 'lucide-react';

export default function EvaluationLabView({ currentUser }) {
  const { data: tasks = [], isLoading } = useEvaluationTasks();
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#050505] flex items-center gap-2"><FlaskConical size={20} className="text-[#653653]" /> Evaluation Lab</h2>
        <p className="text-sm text-[#65676b] mt-0.5">Bring a real-world task, compare multiple AI systems on it, and get evidence behind every score.</p>
      </div>

      <EvaluationTaskForm currentUser={currentUser} onCreated={setSelected} />

      {isLoading ? (
        [...Array(3)].map((_, i) => <div key={i} className="h-28 bg-[#ffffff] rounded-2xl border border-[#e4e6eb] animate-pulse" />)
      ) : tasks.length === 0 ? (
        <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-12 text-center">
          <p className="text-[#65676b] text-sm">No evaluation tasks yet. Create the first one and see which AI is best at it — and why.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <button key={task.id} onClick={() => setSelected(task)} className="w-full text-left bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-4 hover:border-[#653653]/40 transition-colors flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#f2e7ef] text-[#653653] flex items-center justify-center flex-shrink-0"><FlaskConical size={18} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[#050505] truncate">{task.title}</span>
                  <span className="text-[10px] bg-[#f0f2f5] text-[#65676b] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">{domainLabel(task.domain)}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${task.status === 'evaluated' ? 'bg-[#31a24c]/10 text-[#31a24c]' : task.status === 'running' ? 'bg-amber-100 text-amber-700' : 'bg-[#f0f2f5] text-[#65676b]'}`}>
                    {task.status === 'evaluated' ? 'Evaluated' : task.status === 'running' ? 'Running' : 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-[#65676b] mt-1 truncate">{(task.models || []).map(modelLabel).join(' · ')}</p>
                <p className="text-[11px] text-[#65676b] mt-0.5">Created by <span className="font-semibold text-[#050505]">{task.creatorName || 'You'}</span></p>
              </div>
              <ChevronRight size={18} className="text-[#bcc0c4] flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {selected && <EvaluationTaskDetail task={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}