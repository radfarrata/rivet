import React from 'react';
export default function ExpertWorkspaceTabs({ active, onChange }) {
  return <nav aria-label="Expert workspace sections" className="flex flex-wrap gap-2 border-b border-border pb-3 mb-4">{[['evidence', 'Evaluation evidence'], ['credentials', 'Credentials & access'], ['traces', 'Agent traces'], ['audit-advisor', 'Audit Advisor']].map(([id, label]) => <button key={id} onClick={() => onChange(id)} className={`rounded-full px-3 py-2 text-sm border ${active === id ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'}`}>{label}</button>)}</nav>;
}