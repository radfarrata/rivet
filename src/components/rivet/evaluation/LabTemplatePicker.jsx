import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { LAB_TEMPLATES } from '@/components/rivet/evaluation/labTemplates';
import { domainLabel } from '@/components/rivet/evalModels';

export default function LabTemplatePicker({ onLoad, disabled }) {
  const [selectedId, setSelectedId] = useState('');
  const template = LAB_TEMPLATES.find(item => item.id === selectedId);
  return (
    <section className="dark rounded-xl border border-border bg-card p-4 text-card-foreground space-y-3">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold"><FileText size={16} /> Start from a template</h3>
        <p className="mt-1 text-xs text-muted-foreground">Load a ready-to-edit scenario and a scoring rubric out of 100.</p>
      </div>
      <label className="block text-xs font-medium">
        Test scenario
        <select value={selectedId} onChange={event => setSelectedId(event.target.value)} disabled={disabled} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
          <option value="">Choose a template…</option>
          {LAB_TEMPLATES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      {template && <>
        <p className="text-xs text-muted-foreground">{domainLabel(template.domain)} · <span className="capitalize">{template.difficulty}</span></p>
        <details className="text-xs">
          <summary className="cursor-pointer font-medium">Preview scenario</summary>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed text-muted-foreground">{template.prompt}</p>
        </details>
        <div>
          <h4 className="text-xs font-semibold">Evaluation metrics · 100 points total</h4>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">{template.metrics.map(metric => <li key={metric}>{metric}</li>)}</ul>
        </div>
        <p className="text-xs text-muted-foreground">Loading fills the title, scenario, domain, difficulty, and criteria. Your model, visibility, and evaluation-type choices stay unchanged.</p>
        <button type="button" disabled={disabled} onClick={() => onLoad(template)} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">Load template</button>
      </>}
    </section>
  );
}