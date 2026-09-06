import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useTraces, findStepById } from '@/components/expert/useTraces';
import TraceOutline from '@/components/expert/TraceOutline';
import StepDetail from '@/components/expert/StepDetail';
import AdjudicationPanel from '@/components/expert/AdjudicationPanel';
import { ShieldAlert, XCircle, CheckCircle2, Activity, Loader2 } from 'lucide-react';

const STATUS_CHIP = {
  needs_review: 'bg-red-500/15 text-red-400',
  failed: 'bg-orange-500/15 text-orange-400',
  passed: 'bg-emerald-500/15 text-emerald-400',
  adjudicated: 'bg-violet-500/15 text-violet-400',
};

export default function ExpertWorkspace() {
  const { data: traces = [], isLoading } = useTraces();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedStepId, setSelectedStepId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const queue = traces;
  const needsReview = queue.filter((t) => t.status === 'needs_review').length;
  const failedCount = queue.filter((t) => t.status === 'failed').length;
  const adjudicated = queue.filter((t) => t.status === 'adjudicated').length;
  const trace = queue.find((t) => t.id === selectedId) || queue.find((t) => t.status === 'needs_review') || queue[0];
  const step = trace ? findStepById(trace.steps, selectedStepId) : null;

  const selectTrace = (id) => {
    setSelectedId(id);
    setSelectedStepId(null);
  };

  const handleAdjudicated = () => {
    const next = queue.find((t) => t.status === 'needs_review' && t.id !== trace?.id);
    setSelectedId(next ? next.id : null);
    setSelectedStepId(null);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0d] text-[#e6e6ea] overflow-hidden">
      {/* Header */}
      <header className="h-14 flex-shrink-0 flex items-center gap-4 px-4 border-b border-[#232330] bg-[#0e0e12]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#653653] flex items-center justify-center">
            <ShieldAlert size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-white">
              RIVET <span className="text-[#b57fb0] font-medium">Expert Workspace</span>
            </p>
            <p className="text-[10px] text-[#6f6f79]">Pivo Simulation Engine · Trace Adjudication</p>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[11px] font-medium">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/25">
            <ShieldAlert size={12} /> {needsReview} to review
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/25">
            <XCircle size={12} /> {failedCount} failed
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/25">
            <CheckCircle2 size={12} /> {adjudicated} adjudicated
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#653653] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
          {(currentUser?.full_name || 'EX').slice(0, 2).toUpperCase()}
        </div>
      </header>

      {/* Triage queue strip */}
      <div className="h-12 flex-shrink-0 flex items-center gap-1.5 px-3 border-b border-[#232330] bg-[#0c0c10] overflow-x-auto scrollbar-hide">
        <Activity size={13} className="text-[#6f6f79] flex-shrink-0 mr-1" />
        {isLoading ? (
          <span className="text-xs text-[#6f6f79] flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin" /> Loading queue…
          </span>
        ) : queue.length === 0 ? (
          <span className="text-xs text-[#6f6f79]">No traces in the queue.</span>
        ) : (
          queue.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTrace(t.id)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] whitespace-nowrap flex-shrink-0 transition-colors ${trace?.id === t.id ? 'border-[#b57fb0]/50 bg-[#653653]/30 text-white' : 'border-[#232330] bg-[#101016] text-[#a9a9b4] hover:border-[#b57fb0]/30'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${t.severity === 'critical' ? 'bg-red-400' : t.severity === 'high' ? 'bg-orange-400' : t.severity === 'medium' ? 'bg-amber-400' : 'bg-zinc-400'}`} />
              <span className="font-medium truncate max-w-[180px]">{t.caseTitle}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${STATUS_CHIP[t.status] || 'bg-zinc-500/15 text-zinc-400'}`}>
                {t.status.replace('_', ' ')}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Three-pane workspace */}
      <div className="flex flex-1 min-h-0">
        {trace ? (
          <>
            <TraceOutline trace={trace} selectedStepId={selectedStepId} onSelectStep={setSelectedStepId} />
            <StepDetail trace={trace} step={step} />
            <AdjudicationPanel trace={trace} currentUser={currentUser} onAdjudicated={handleAdjudicated} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-[#6f6f79]">
            No traces yet. Run a Pivo test suite to populate the triage queue.
          </div>
        )}
      </div>
    </div>
  );
}