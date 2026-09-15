import React from 'react';
import { Loader2, ServerCog } from 'lucide-react';
import useEvaluationInfrastructure from '@/components/rivet/infrastructure/useEvaluationInfrastructure';
import InfrastructureSummary from '@/components/rivet/infrastructure/InfrastructureSummary';
import ReleaseGatePanel from '@/components/rivet/infrastructure/ReleaseGatePanel';
import ReleaseHistory from '@/components/rivet/infrastructure/ReleaseHistory';
import ApiAccessPanel from '@/components/rivet/infrastructure/ApiAccessPanel';

export default function EvaluationInfrastructureView({ onNavigate }) {
  const { data, isLoading, isError, refetch, gate } = useEvaluationInfrastructure();
  if (isLoading) return <p className="flex items-center gap-2 text-sm text-[#71767b]"><Loader2 size={15} className="animate-spin" /> Loading evaluation infrastructure…</p>;
  if (isError) return <p role="alert" className="text-sm text-red-400">Infrastructure records could not be loaded. <button onClick={() => refetch()} className="underline">Retry</button></p>;
  return <div className="mx-auto max-w-5xl space-y-5"><header><h1 className="flex items-center gap-2 text-xl font-bold text-white"><ServerCog size={19} className="text-[#b06d97]" /> Evaluation infrastructure</h1><p className="mt-1 text-sm text-[#71767b]">Versioned evidence, private evaluation boundaries, and release decisions developers can enforce.</p></header><InfrastructureSummary data={data} /><div className="grid items-start gap-5 lg:grid-cols-[1.25fr_.75fr]"><ReleaseGatePanel tests={data.tests} gate={gate} onOpenExperts={() => onNavigate('expert-workspace')} /><div className="space-y-5"><ApiAccessPanel /><ReleaseHistory releases={data.releases} /></div></div></div>;
}