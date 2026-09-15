import React from 'react';
import { RIVET_MODELS } from '@/components/rivet/evalModels';

export default function CompactModelPicker({ value, onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter(item => item !== id) : [...value, id]);
  return <fieldset className="sm:pl-[52px]">
    <legend className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#71767b]">Models to compare · choose at least two</legend>
    <div className="flex flex-wrap gap-2">{RIVET_MODELS.map(model => {
      const active = value.includes(model.id);
      return <button type="button" key={model.id} aria-pressed={active} onClick={() => toggle(model.id)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${active ? 'border-[#b06d97] bg-[#653653]/35 text-white' : 'border-[#2f3336] text-[#71767b] hover:text-white'}`}>{model.label}</button>;
    })}</div>
  </fieldset>;
}