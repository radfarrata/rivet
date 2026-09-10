import React from 'react';
import { Bookmark } from 'lucide-react';
import { useSavedTasks, useToggleSavedTask } from './useSavedTasks';

export default function SaveTaskButton({ task, showLabel = false }) {
  const { data: savedTasks = [] } = useSavedTasks();
  const toggle = useToggleSavedTask();
  const saved = savedTasks.find(s => s.taskId === task.id);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle.mutate({ task, saved }); }}
      title={saved ? 'Remove from saved tasks' : 'Save this task'}
      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${saved ? 'text-[#b06d97]' : 'text-[#6b7080] hover:text-[#b06d97]'}`}
    >
      <Bookmark size={14} className={saved ? 'fill-current' : ''} />
      {showLabel && (saved ? 'Saved' : 'Save')}
    </button>
  );
}