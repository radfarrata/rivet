import React from 'react';
import {
  Terminal, Brain, Search, FileText, Wrench, Zap, MessageSquare, ShieldAlert,
} from 'lucide-react';

const TYPE_ICONS = {
  input: Terminal, reasoning: Brain, search: Search, retrieval: FileText,
  tool_call: Wrench, tool_result: Zap, output: MessageSquare,
};
const TYPE_LABELS = {
  input: 'Input', reasoning: 'Reasoning', search: 'Search', retrieval: 'Retrieval',
  tool_call: 'Tool Call', tool_result: 'Tool Result', output: 'Final Output',
};
const SEV_CHIP = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  low: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
};

function prettyJson(s) {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s || '';
  }
}

function StepBody({ step }) {
  if (step.type === 'tool_call' || step.type === 'tool_result') {
    return (
      <pre className="bg-[#101016] border border-[#232330] rounded-lg p-3 text-[11px] font-mono text-[#c9c9d4] overflow-x-auto whitespace-pre-wrap">
        <code>{prettyJson(step.content)}</code>
      </pre>
    );
  }
  if (step.type === 'retrieval') {
    const restricted = /restricted|unauthorized/i.test(step.meta || '') || /RESTRICTED/i.test(step.title || '');
    return (
      <div className={`rounded-lg border p-3 ${restricted ? 'border-red-500/40 bg-red-500/5' : 'border-[#232330] bg-[#101016]'}`}>
        <p className="text-xs text-[#d4d4dc] leading-relaxed whitespace-pre-wrap">{step.content}</p>
        {step.meta && (
          <p className={`mt-2 text-[10px] font-medium ${restricted ? 'text-red-400' : 'text-[#6f6f79]'}`}>{step.meta}</p>
        )}
      </div>
    );
  }
  if (step.type === 'reasoning') {
    return (
      <blockquote className="border-l-2 border-violet-500/50 pl-3 text-xs text-[#a9a9b4] italic leading-relaxed whitespace-pre-wrap">
        Hidden or unverified internal reasoning is not displayed. Inspect the structured judge decision and evidence excerpts instead.
      </blockquote>
    );
  }
  return <p className="text-sm text-[#d4d4dc] leading-relaxed whitespace-pre-wrap">{step.content}</p>;
}

export default function StepDetail({ trace, step }) {
  if (!trace) return <main className="flex-1 min-w-0 bg-[#0a0a0d]" />;

  if (!step) {
    return (
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#0a0a0d]">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-[#ececf1]">{trace.caseTitle}</h2>
            {trace.severity && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide ${SEV_CHIP[trace.severity]}`}>{trace.severity}</span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-500/15 text-zinc-400 font-semibold uppercase tracking-wide">{trace.status.replace('_', ' ')}</span>
          </div>

          {trace.flaggedReason && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-4">
              <p className="text-[11px] font-semibold text-red-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <ShieldAlert size={13} /> Pivo Flag
              </p>
              <p className="text-xs text-[#d4d4dc] leading-relaxed">{trace.flaggedReason}</p>
            </div>
          )}

          {trace.finalOutput && (
            <div>
              <p className="text-[11px] font-semibold text-[#9a9aa5] uppercase tracking-widest mb-1.5">Final Output</p>
              <div className="rounded-lg border border-[#232330] bg-[#101016] p-3">
                <p className="text-sm text-[#d4d4dc] leading-relaxed whitespace-pre-wrap">{trace.finalOutput}</p>
              </div>
            </div>
          )}

          <p className="text-[10px] text-[#6f6f79]">Select any step in the outline to inspect inputs, retrievals, and tool calls in full detail.</p>
        </div>
      </main>
    );
  }

  const Icon = TYPE_ICONS[step.type] || FileText;

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-[#0a0a0d]">
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-8 h-8 rounded-lg bg-[#17171e] border border-[#2a2a34] flex items-center justify-center">
            <Icon size={15} className="text-[#b57fb0]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-[#9a9aa5] uppercase tracking-widest">{TYPE_LABELS[step.type] || step.type}</p>
            <p className="text-sm font-semibold text-[#ececf1] truncate">{step.title}</p>
          </div>
          {step.tool && <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#17171e] border border-[#2a2a34] text-[#b57fb0]">{step.tool}</span>}
          {step.durationMs ? <span className="text-[10px] text-[#6f6f79]">{step.durationMs}ms</span> : null}
        </div>

        <StepBody step={step} />

        {(step.children || []).length > 0 && (
          <div className="space-y-4 border-l-2 border-[#2a2a34] pl-4 ml-1">
            {step.children.map((child, i) => {
              const ChildIcon = TYPE_ICONS[child.type] || FileText;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ChildIcon size={12} className="text-[#8b8b94]" />
                    <span className="text-[11px] font-semibold text-[#c9c9d4]">{child.title}</span>
                    {child.durationMs ? <span className="text-[10px] text-[#6f6f79]">{child.durationMs}ms</span> : null}
                  </div>
                  <StepBody step={child} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}