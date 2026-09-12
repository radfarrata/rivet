import React, { useState } from 'react';
import ExpertWorkspaceTabs from '@/components/rivet/integrity/ExpertWorkspaceTabs';
import ExpertIntegrityPanel from '@/components/rivet/integrity/ExpertIntegrityPanel';
import EvaluationReviewQueue from '@/components/rivet/integrity/EvaluationReviewQueue';
import AuditAdvisorView from '@/components/rivet/integrity/AuditAdvisorView';
import { useTraces, findStepById } from '@/components/expert/useTraces';
import TraceOutline from '@/components/expert/TraceOutline';
import StepDetail from '@/components/expert/StepDetail';
import AdjudicationPanel from '@/components/expert/AdjudicationPanel';
import { ShieldAlert, XCircle, CheckCircle2, Activity, Loader2 } from 'lucide-react';

const STATUS_CHIP = {
  needs_review: 'bg-red-500/15 text-red-400',
  failed: 'bg-orange-500/15 text-orange-400',
  passed: 'bg-emerald-500/15 text-emerald-400',
  adjudicated: 'bg-[#653653]/30 text-[#d9b8cd]',
};
const SEV_DOT = { critical: 'bg-red-400', high: 'bg-orange-400', medium: 'bg-amber-400' };

export default function ExpertWorkspaceView({ currentUser }) {
  const { data: traces = [], isLoading } = useTraces();
  const [section, setSection] = useState('evidence');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedStepId, setSelectedStepId] = useState(null);

  const needsReview = traces.filter(t => t.status === 'needs_review').length;
  const failedCount = traces.filter(t => t.status === 'failed').length;
  const adjudicated = traces.filter(t => t.status === 'adjudicated').length;
  const trace = traces.find(t => t.id === selectedId) || traces.find(t => t.status === 'needs_review') || traces[0];
  const step = trace ? findStepById(trace.steps, selectedStepId) : null;

  const selectTrace = (id) => { setSelectedId(id); setSelectedStepId(null); };
  const handleAdjudicated = () => {
    const next = traces.find(t => t.status === 'needs_review' && t.id !== trace?.id);
    setSelectedId(next ? next.id : null);
    setSelectedStepId(null);
  };

  if (section !== 'traces') return <div className="dark text-foreground max-w-5xl mx-auto"><ExpertWorkspaceTabs active={section} onChange={setSection} />{section === 'credentials' ? <ExpertIntegrityPanel /> : section === 'audit-advisor' ? <AuditAdvisorView /> : <EvaluationReviewQueue />}</div>;
  return (
    <div className="dark flex flex-col h-[calc(100vh-112px)] rounded-2xl border border-[#2f3336] bg-black overflow-hidden text-[#e7e9ea]">
      <ExpertWorkspaceTabs active={section} onChange={setSection} />
      <header className="h-14 flex-shrink-0 flex items-center gap-4 px-4 border-b border-[#2f3336]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#653653] flex items-center justify-center"><ShieldAlert size={17} className="text-white" /></div>
          <div>
            <p className="text-sm font-bold text-white">Expert Workspace</p>
            <p className="text-[10px] text-[#71767b]">Trace adjudication · Regression library</p>
          </div>
        </div>
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/25"><ShieldAlert size={12} /> {needsReview} to review</span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/25"><XCircle size={12} /> {failedCount} failed</span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#653653]/20 text-[#d9b8cd] border border-[#653653]/50"><CheckCircle2 size={12} /> {adjudicated} adjudicated</span>
        </div>
      </header>

      <div className="h-12 flex-shrink-0 flex items-center gap-1.5 px-3 border-b border-[#2f3336] overflow-x-auto scrollbar-hide">
        <Activity size={13} className="text-[#71767b] flex-shrink-0 mr-1" />
        {isLoading ? (
          <span className="text-xs text-[#71767b] flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Loading queue…</span>
        ) : traces.length === 0 ? (
          <span className="text-xs text-[#71767b]">No traces in the queue.</span>
        ) : traces.map(t => (
          <button
            key={t.id}
            onClick={() => selectTrace(t.id)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] whitespace-nowrap flex-shrink-0 transition-colors ${trace?.id === t.id ? 'border-[#b06d97]/60 bg-[#653653]/30 text-white' : 'border-[#2f3336] bg-[#16181c] text-[#e7e9ea] hover:border-[#71767b]'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${SEV_DOT[t.severity] || 'bg-zinc-400'}`} />
            <span className="font-medium truncate max-w-[180px]">{t.caseTitle}</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${STATUS_CHIP[t.status] || 'bg-zinc-500/15 text-zinc-400'}`}>{t.status.replace('_', ' ')}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0">
        {trace ? (
          <>
            <TraceOutline trace={trace} selectedStepId={selectedStepId} onSelectStep={setSelectedStepId} />
            <StepDetail trace={trace} step={step} />
            <AdjudicationPanel trace={trace} currentUser={currentUser} onAdjudicated={handleAdjudicated} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-[#71767b]">No traces yet. Run a test suite to populate the triage queue.</div>
        )}
      </div>
    </div>
  );
}