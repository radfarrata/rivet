import React, { useEffect, useState } from 'react';
import { useEvaluationTasks } from '../useEvaluations';
import { visibleTo } from '../evalStats';
import EvaluationTaskForm from '../EvaluationTaskForm';
import EvaluationTaskDetail from '../EvaluationTaskDetail';
import { domainLabel, modelLabel } from '../evalModels';
import { FlaskConical, ChevronRight, Lock } from 'lucide-react';
import RivetEmptyState from '../RivetEmptyState';
import DomainReportBuilder from '@/components/rivet/reports/DomainReportBuilder';
import ResearchEvaluationFlow from '@/components/rivet/evaluation/ResearchEvaluationFlow';

export default function EvaluationLabView({ currentUser, initialTask, onInitialTaskHandled }) {
  const { data: allTasks = [], isLoading, isError, refetch } = useEvaluationTasks();
  const [selected, setSelected] = useState(initialTask || null);
  useEffect(() => { if (initialTask) { setSelected(initialTask); onInitialTaskHandled?.(); } }, [initialTask, onInitialTaskHandled]);
  const [scope, setScope] = useState('all');
  const tasks = visibleTo(allTasks, currentUser).filter(t => scope === 'mine' ? (t.ownerId || t.created_by_id) === currentUser?.id : true);

  return (
    <div className="space-y-5 max-w-[900px] mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><FlaskConical size={20} className="text-[#b06d97]" /> Evaluation Lab</h2>
        <p className="text-sm text-[#8b90a0] mt-0.5">Bring a real-world task, compare multiple AI systems on it, and get evidence behind every score.</p>
      </div>
      <ResearchEvaluationFlow />

      <DomainReportBuilder currentUser={currentUser} />
      <EvaluationTaskForm currentUser={currentUser} onCreated={setSelected} enableTemplates />

      <div className="flex gap-1 bg-[#12141b] border border-[#1f232e] rounded-xl p-1 w-fit">
        {[['all', 'All tasks'], ['mine', 'Your tasks']].map(([id, label]) => (
          <button key={id} onClick={() => setScope(id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${scope === id ? 'bg-[#653653] text-white' : 'text-[#8b90a0] hover:text-white'}`}>{label}</button>
        ))}
      </div>

      {isError ? <div role="alert" className="text-sm text-destructive">Could not load your authorized tasks. <button className="underline" onClick={() => refetch()}>Retry</button></div> : isLoading ? (
        [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[#12141b] rounded-2xl border border-[#1f232e] animate-pulse" />)
      ) : tasks.length === 0 ? (
        <div className="bg-[#16181c] rounded-2xl border border-[#2f3336]">
          <RivetEmptyState title="No evaluation tasks yet" description="Create the first one and see which AI is best at it — and why." />
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map(task => (
            <button key={task.id} onClick={() => setSelected(task)} className="w-full text-left bg-[#12141b] rounded-2xl border border-[#1f232e] p-4 hover:border-[#653653]/40 transition-colors flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#b06d97]/10 text-[#b06d97] flex items-center justify-center flex-shrink-0"><FlaskConical size={18} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white truncate">{task.title}</span>
                  <span className="text-[10px] bg-[#1f232e] text-[#b8bcc8] px-2 py-0.5 rounded-md font-semibold">{domainLabel(task.domain)}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold capitalize ${task.status === 'evaluated' ? 'bg-[#2fd4a7]/15 text-[#2fd4a7]' : task.status === 'running' ? 'bg-[#f5b544]/15 text-[#f5b544]' : 'bg-[#1f232e] text-[#8b90a0]'}`}>{task.status}</span>
                  {task.visibility === 'private' && <Lock size={12} className="text-[#6b7080]" />}
                </div>
                <p className="text-xs text-[#8b90a0] mt-1 truncate">{(task.models || []).map(modelLabel).join(' · ')}</p>
                <p className="text-[11px] text-[#6b7080] mt-0.5">Created by <span className="font-semibold text-[#b8bcc8]">{task.creatorName || 'You'}</span></p>
              </div>
              <ChevronRight size={18} className="text-[#6b7080] flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {selected && <EvaluationTaskDetail task={selected} currentUser={currentUser} onClose={() => setSelected(null)} />}
    </div>
  );
}