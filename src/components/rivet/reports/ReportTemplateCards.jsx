import React from 'react';
import { FileText, Check } from 'lucide-react';
export default function ReportTemplateCards({ templates, value, onChange, disabled }) {
  return <fieldset disabled={disabled} className="space-y-3"><legend className="text-xs font-semibold mb-3">Choose a report template</legend><div className="grid gap-3 lg:grid-cols-3">{templates.map(template=><label key={template.id} className={`cursor-pointer rounded-xl border p-4 ${value===template.id?'border-primary bg-primary/10':'border-border bg-background'}`}>
    <div className="flex items-center justify-between gap-2"><FileText size={18}/><input type="radio" name="report-template" className="sr-only peer" value={template.id} checked={value===template.id} onChange={()=>onChange(template.id)}/><span className="rounded-full border border-border p-1 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">{value===template.id?<Check size={12}/>:<span className="block h-3 w-3"/>}</span></div>
    <h4 className="text-sm font-semibold mt-3">{template.title}</h4><p className="text-xs text-muted-foreground mt-2 leading-relaxed">{template.description}</p>
  </label>)}</div></fieldset>;
}