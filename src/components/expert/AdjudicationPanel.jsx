import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { integrity } from '@/components/rivet/integrity/client';
import { toast } from '@/components/ui/use-toast';
import { Gavel, Loader2, ArrowRight } from 'lucide-react';

const VERDICTS = [
  { id: 'confirmed_failure', label: 'Confirmed failure' },
  { id: 'false_positive', label: 'False positive' },
  { id: 'needs_info', label: 'Needs info' },
];
const FAILURE_TYPES = ['hallucination', 'tool_misuse', 'safety_violation', 'non_compliance', 'logic_error', 'other'];
const SEVERITIES = ['critical', 'high', 'medium', 'low'];

const inputCls = 'w-full bg-[#101016] border border-[#2a2a34] rounded-lg px-3 py-2 text-xs text-[#e6e6ea] placeholder-[#6f6f79] focus:outline-none focus:border-[#b57fb0]/60';

export default function AdjudicationPanel({ trace, currentUser, onAdjudicated }) {
  const queryClient = useQueryClient();
  const [verdict, setVerdict] = useState('confirmed_failure');
  const [severity, setSeverity] = useState('high');
  const [failureType, setFailureType] = useState('hallucination');
  const [structuredFeedback, setStructuredFeedback] = useState('');
  const [ruleDefinition, setRuleDefinition] = useState('');
  const [conflictDeclaration, setConflictDeclaration] = useState('');

  useEffect(() => {
    setVerdict('confirmed_failure');
    setSeverity(trace?.severity || 'high');
    setFailureType('hallucination');
    setStructuredFeedback('');
    setRuleDefinition('');
  }, [trace?.id]);

  const submit = useMutation({
    mutationFn: () => integrity('legacyAdjudication', { traceId: trace.id, verdict, severity, failureType, structuredFeedback, ruleDefinition, conflictDeclaration }),
    onSuccess: ({ regression }) => {
      queryClient.invalidateQueries({ queryKey: ['pivo-traces'] });
      toast({
        title: regression ? 'Adjudication saved — inactive regression created' : 'Adjudication saved',
        description: regression
          ? 'Review and approve the inactive regression before using it in a release gate.'
          : 'Trace moved out of the triage queue.',
      });
      onAdjudicated?.();
    },
  });

  if (!trace) return null;

  const canSubmit =
    !submit.isPending &&
    structuredFeedback.trim().length >= 20 && conflictDeclaration.trim().length >= 10 &&
    (verdict !== 'confirmed_failure' || (ruleDefinition.trim().length > 0 && failureType));

  return (
    <aside className="w-[340px] flex-shrink-0 border-l border-[#232330] bg-[#0e0e12] overflow-y-auto">
      <div className="p-4 space-y-4">
        <div>
          <p className="text-[11px] font-semibold text-[#9a9aa5] uppercase tracking-widest flex items-center gap-1.5">
            <Gavel size={12} /> Adjudication
          </p>
          <p className="text-xs text-[#d4d4dc] font-medium mt-1 truncate">{trace.caseTitle}</p>
        </div>

        {trace.status !== 'needs_review' ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-3">
              <p className="text-xs text-violet-300 font-medium">This trace has already been adjudicated.</p>
            </div>
            <button
              onClick={onAdjudicated}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#653653] text-white hover:bg-[#7a4063] transition-colors"
            >
              Next in queue <ArrowRight size={13} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold text-[#9a9aa5] uppercase tracking-wide">Verdict</label>
              <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                {VERDICTS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVerdict(v.id)}
                    className={`px-2 py-2 rounded-lg text-[10px] font-semibold border transition-colors ${verdict === v.id ? 'bg-[#653653] text-white border-[#b57fb0]/50' : 'bg-[#101016] text-[#a9a9b4] border-[#2a2a34] hover:border-[#b57fb0]/40'}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-[#9a9aa5] uppercase tracking-wide">Severity</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={`${inputCls} mt-1.5 cursor-pointer`}>
                  {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {verdict === 'confirmed_failure' && (
                <div>
                  <label className="text-[10px] font-semibold text-[#9a9aa5] uppercase tracking-wide">Failure type</label>
                  <select value={failureType} onChange={(e) => setFailureType(e.target.value)} className={`${inputCls} mt-1.5 cursor-pointer`}>
                    {FAILURE_TYPES.map((f) => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#9a9aa5] uppercase tracking-wide">Structured feedback</label>
              <textarea
                value={structuredFeedback}
                onChange={(e) => setStructuredFeedback(e.target.value)}
                rows={4}
                placeholder="What went wrong, and what should have happened? This becomes the expected-behavior spec."
                className={`${inputCls} mt-1.5 resize-none`}
              />
            </div>

            {verdict === 'confirmed_failure' && (
              <div>
                <label className="text-[10px] font-semibold text-[#9a9aa5] uppercase tracking-wide">
                  Rule for the AI <span className="text-[#b57fb0] normal-case">(becomes a regression test)</span>
                </label>
                <textarea
                  value={ruleDefinition}
                  onChange={(e) => setRuleDefinition(e.target.value)}
                  rows={3}
                  placeholder="e.g. Never retrieve or cite documents marked restricted. When CrCl < 30 mL/min, apply the 40% renal dose reduction."
                  className={`${inputCls} mt-1.5 resize-none`}
                />
              </div>
            )}

            <label className="block text-xs text-muted-foreground">Conflict declaration<textarea value={conflictDeclaration} onChange={e => setConflictDeclaration(e.target.value)} placeholder="Declare affiliations and conflicts for this trace." className={`${inputCls} mt-2`} /></label>
            {submit.isError && <p role="alert" className="text-xs text-destructive">{submit.error?.response?.data?.error || submit.error.message}</p>}
            <button
              onClick={() => submit.mutate()}
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold bg-[#653653] text-white hover:bg-[#7a4063] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submit.isPending ? (
                <><Loader2 size={13} className="animate-spin" /> Saving…</>
              ) : (
                'Submit adjudication'
              )}
            </button>

            {verdict === 'confirmed_failure' && (
              <p className="text-[10px] text-[#6f6f79] text-center">
                Submitting creates an inactive regression for approval; it does not automatically gate a release.
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}