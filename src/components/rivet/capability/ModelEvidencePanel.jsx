import React from 'react';
import EvidenceLink from '@/components/rivet/integrity/EvidenceLink';
import { X, Bot, Users, Layers, ShieldCheck, ThumbsUp, ThumbsDown } from 'lucide-react';
import { modelLabel, domainLabel } from '../evalModels';
import { FAILURE_LABELS } from '../evalStats';

const Stat = ({ icon: Icon, label, value }) => (
  <div className="bg-[#12141b] border border-[#1f232e] rounded-xl p-3">
    <p className="text-[10px] text-[#6b7080] uppercase tracking-wide flex items-center gap-1"><Icon size={11} /> {label}</p>
    <p className="text-base font-bold text-white mt-1">{value}</p>
  </div>
);

const Example = ({ label, item, color, icon: Icon }) => item && (
  <div className="bg-[#12141b] border border-[#1f232e] rounded-xl p-3">
    <p className={`text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1 ${color}`}><Icon size={11} /> {label} · {item.score}%</p>
    <p className="text-sm font-semibold text-white mt-1">{item.taskTitle}</p>
    <p className="text-xs text-[#8b90a0] mt-0.5">{item.summary}</p>
    <p className="text-[10px] text-[#6b7080] mt-1.5">Task by {item.creator || 'Unknown'} · {domainLabel(item.domain)} · {item.difficulty}</p>
  </div>
);

export default function ModelEvidencePanel({ row, onClose }) {
  const failures = Object.entries(row.failures).sort((a, b) => b[1] - a[1]);
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0e1017] border border-[#1f232e] rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0e1017]/95 backdrop-blur-md border-b border-[#1f232e] px-6 py-4 flex items-start justify-between z-10">
          <div>
            <p className="text-[10px] text-[#b06d97] font-semibold uppercase tracking-widest">Evidence behind the score</p>
            <h2 className="text-lg font-bold text-white">{modelLabel(row.modelId)} — {row.avg.toFixed(1)}</h2>
            <p className="text-xs text-[#8b90a0]">Model version: {row.modelId} · Confidence: <span className={row.confidence === 'High' ? 'text-[#2fd4a7]' : row.confidence === 'Medium' ? 'text-[#f5b544]' : 'text-[#ff6b6b]'}>{row.confidence}</span> ({row.n} evaluation{row.n === 1 ? '' : 's'})</p>
          </div>
          <button onClick={onClose} className="p-2 text-[#8b90a0] hover:text-white hover:bg-[#151823] rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <Stat icon={Layers} label="Tasks evaluated" value={row.taskCount} />
            <Stat icon={Bot} label="Automated avg" value={`${row.autoAvg.toFixed(1)}`} />
            <Stat icon={Users} label="Human evaluations" value={`${row.humanN} · ${row.evaluators} people`} />
            <Stat icon={ShieldCheck} label="Evaluator agreement" value={row.agreement == null ? '—' : `${row.agreement}%`} />
          </div>
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            {row.domains.map(d => <span key={d} className="px-2 py-0.5 rounded-md bg-[#b06d97]/10 text-[#b06d97] font-semibold">{domainLabel(d)}</span>)}
            {Object.entries(row.difficulty).map(([d, n]) => <span key={d} className="px-2 py-0.5 rounded-md bg-[#1f232e] text-[#b8bcc8] font-semibold capitalize">{d} ×{n}</span>)}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#8b90a0] uppercase tracking-wide mb-1.5">Failure categories (human-identified)</p>
            {failures.length === 0 ? <p className="text-xs text-[#6b7080]">No failures identified by evaluators yet.</p> : (
              <div className="flex flex-wrap gap-1.5">{failures.map(([k, n]) => <span key={k} className="text-[11px] px-2 py-1 rounded-md bg-[#ff6b6b]/10 text-[#ff6b6b] font-semibold">{FAILURE_LABELS[k]} ×{n}</span>)}</div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-2.5">
            <Example label="Strongest response" item={row.best} color="text-[#2fd4a7]" icon={ThumbsUp} />
            <Example label="Weakest response" item={row.worst} color="text-[#ff6b6b]" icon={ThumbsDown} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#8b90a0] uppercase tracking-wide mb-1.5">Evaluation history</p>
            <div className="space-y-1">
              {row.history.map(h => (
                <div key={h.id} className="flex items-center gap-3 text-xs bg-[#12141b] border border-[#1f232e] rounded-lg px-3 py-2">
                  <span className="text-[#6b7080] w-20 flex-shrink-0">{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="flex-1 text-white truncate">{h.taskTitle}</span>
                  <span className="text-[#6b7080] hidden sm:inline">{h.human ? `${h.human.n} human` : 'auto'}</span>
                  <span className="font-bold text-white w-10 text-right">{h.score}%</span>
                  <EvidenceLink resultId={h.id} legacy={!h.evidenceId} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}