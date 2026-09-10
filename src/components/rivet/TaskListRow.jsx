import React from 'react';
import { Layers, Users, ChevronRight } from 'lucide-react';
import { domainLabel } from './evalModels';
import SaveTaskButton from './SaveTaskButton';

// Compact list row used by Explore Tasks and Saved Tasks.
export default function TaskListRow({ task, resultCount = 0, evaluatorCount = 0, onOpen }) {
  return (
    <button onClick={() => onOpen(task)} className="w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-[#171a23] transition-colors border-b border-[#1f232e]">
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#b06d97]/10 text-[#b06d97] font-semibold">{domainLabel(task.domain)}</span>
          <span className="text-[10px] uppercase tracking-wide text-[#6b7080]">{task.difficulty}</span>
          <span className={`text-[10px] font-semibold ${task.status === 'evaluated' ? 'text-[#2fd4a7]' : 'text-[#f5b544]'}`}>{task.status}</span>
        </span>
        <span className="block text-sm font-semibold text-white truncate mt-1">{task.title}</span>
        <span className="flex items-center gap-4 mt-1 text-[11px] text-[#6b7080]">
          <span className="flex items-center gap-1"><Layers size={12} /> {resultCount} models</span>
          <span className="flex items-center gap-1"><Users size={12} /> {evaluatorCount} evaluations</span>
          <span className="truncate">by {task.creatorName || 'You'}</span>
        </span>
      </span>
      <SaveTaskButton task={task} />
      <ChevronRight size={15} className="text-[#3a3f4d] flex-shrink-0" />
    </button>
  );
}