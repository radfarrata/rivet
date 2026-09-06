import React, { useState } from 'react';
import {
  Terminal, Brain, Search, FileText, Wrench, Zap, MessageSquare, ChevronDown, ChevronRight,
} from 'lucide-react';

const TYPE_ICONS = {
  input: Terminal, reasoning: Brain, search: Search, retrieval: FileText,
  tool_call: Wrench, tool_result: Zap, output: MessageSquare,
};
const TYPE_COLORS = {
  input: 'text-sky-400', reasoning: 'text-violet-400', search: 'text-blue-300',
  retrieval: 'text-emerald-400', tool_call: 'text-amber-400', tool_result: 'text-amber-200',
  output: 'text-pink-400',
};

export default function TraceOutline({ trace, selectedStepId, onSelectStep }) {
  const [collapsed, setCollapsed] = useState(() => new Set());

  if (!trace) {
    return <aside className="w-[290px] flex-shrink-0 border-r border-[#232330] bg-[#0e0e12]" />;
  }

  const flagged = new Set(trace.flaggedStepIds || []);
  const toggle = (id) => setCollapsed((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const renderStep = (step, key) => {
    const Icon = TYPE_ICONS[step.type] || FileText;
    const isFlagged = flagged.has(step.id);
    const isSelected = selectedStepId === step.id;
    const hasChildren = (step.children || []).length > 0;
    const isCollapsed = collapsed.has(step.id);

    return (
      <div key={key}>
        <div
          onClick={() => onSelectStep?.(step.id)}
          className={`flex items-center gap-2 py-1.5 px-2 mx-1 rounded-md cursor-pointer text-xs transition-colors ${isSelected ? 'bg-[#653653]/40' : 'hover:bg-[#17171e]'}`}
        >
          <Icon size={13} className={`flex-shrink-0 ${TYPE_COLORS[step.type] || 'text-zinc-400'}`} />
          <span className={`flex-1 min-w-0 truncate ${isFlagged ? 'text-red-400 font-medium' : 'text-[#d4d4dc]'}`}>{step.title}</span>
          {step.durationMs ? <span className="text-[10px] text-[#6f6f79] flex-shrink-0">{step.durationMs}ms</span> : null}
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); toggle(step.id); }}
              className="text-[#6f6f79] hover:text-[#d4d4dc]"
            >
              {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
        {hasChildren && !isCollapsed && (
          <div className="ml-[19px] pl-2 border-l border-[#2a2a34]">
            {step.children.map((c, i) => renderStep(c, `${key}-${i}`))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-[290px] flex-shrink-0 border-r border-[#232330] bg-[#0e0e12] flex flex-col min-h-0">
      <div className="px-3 py-2.5 border-b border-[#232330] flex-shrink-0">
        <p className="text-[11px] font-semibold text-[#9a9aa5] uppercase tracking-widest">Trace Outline</p>
        <p className="text-xs text-[#d4d4dc] font-medium truncate mt-1">{trace.caseTitle}</p>
        <p className="text-[10px] text-[#6f6f79] truncate">{trace.agentName} · {trace.runId} · {trace.caseId}</p>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {(trace.steps || []).map((s, i) => renderStep(s, String(i)))}
      </div>
    </aside>
  );
}