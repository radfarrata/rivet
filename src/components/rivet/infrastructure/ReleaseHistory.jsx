import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function ReleaseHistory({ releases }) {
  return <section className="rounded-2xl border border-[#2f3336] bg-[#16181c] overflow-hidden"><div className="border-b border-[#2f3336] p-4"><h2 className="text-sm font-bold text-white">Release decisions</h2><p className="text-xs text-[#71767b]">Immutable, provenance-hashed gate snapshots.</p></div>
    {!releases.length ? <p className="p-5 text-xs text-[#71767b]">No releases have been evaluated.</p> : <div className="divide-y divide-[#2f3336]">{releases.map(item => <div key={item.id} className="flex items-center gap-3 p-4">{item.status === 'passed' ? <CheckCircle2 size={17} className="text-emerald-400" /> : <XCircle size={17} className="text-red-400" />}<div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{item.agentName || item.agentId} · {item.version}</p><p className="text-[11px] text-[#71767b]">{item.passedTests || 0}/{item.totalTests || 0} passed · {item.gatePolicyVersion || 'legacy policy'}</p></div><span className={`text-[10px] font-bold uppercase ${item.status === 'passed' ? 'text-emerald-400' : 'text-red-400'}`}>{item.status}</span></div>)}</div>}
  </section>;
}