import React from 'react';
import { ArrowLeftRight, BarChart3, FlaskConical, ShieldCheck } from 'lucide-react';

const steps = [
  [FlaskConical, '1. Define', 'Real task + rubric'],
  [ArrowLeftRight, '2. Compare', 'Same task, chosen models'],
  [ShieldCheck, '3. Verify', 'Automated + human evidence'],
  [BarChart3, '4. Map', 'Domain capability signal'],
];
export default function ResearchEvaluationFlow() {
  return <section aria-label="Evaluation workflow" className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#2f3336] bg-black md:grid-cols-4">
    {steps.map(([Icon, title, detail], index) => <div key={title} className={`p-3 ${index ? 'border-l border-[#2f3336]' : ''} ${index > 1 ? 'border-t border-[#2f3336] md:border-t-0' : ''}`}><Icon size={15} className="mb-2 text-[#b06d97]" /><p className="text-xs font-bold text-white">{title}</p><p className="mt-0.5 text-[10px] text-[#71767b]">{detail}</p></div>)}
  </section>;
}