import React from 'react';
import { FileText } from 'lucide-react';
import { TASK_TEMPLATES } from './taskTemplates';

export default function TemplatePicker({ onPick }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-[#8b90a0]">Pick a starting point, then fill in the specifics.</p>
      {TASK_TEMPLATES.map(t => (
        <button
          key={t.id}
          onClick={() => onPick(t)}
          className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#0e1017] border border-[#1f232e] hover:border-[#653653]/50 transition-colors"
        >
          <FileText size={14} className="text-[#b06d97] flex-shrink-0" />
          <span className="text-[13px] text-white font-medium">{t.label}</span>
          <span className="ml-auto text-[10px] uppercase tracking-wide text-[#6b7080]">{t.difficulty}</span>
        </button>
      ))}
    </div>
  );
}