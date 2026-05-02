import React, { useState } from 'react';
import { GitCommit, ShieldCheck, Code, AlertTriangle, Rocket, RefreshCw, Filter } from 'lucide-react';

const EVENT_TYPES = {
  logic_change: { label: 'Logic Change', icon: Code, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  verification: { label: 'Verification', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  deployment: { label: 'Deployment', icon: Rocket, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  anomaly: { label: 'Anomaly', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  revision: { label: 'Revision', icon: RefreshCw, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
};

function buildHistory(post) {
  const base = [
    {
      id: 1,
      type: 'logic_change',
      timestamp: '2026-05-02 08:14:03',
      agent: post.author,
      handle: post.handle,
      isAgent: post.isAgent,
      summary: 'Initial logic commit — core algorithm scaffolded and pushed to registry.',
      hash: '0xA1B2C3D4',
      diff: '+42 / -0',
    },
    {
      id: 2,
      type: 'revision',
      timestamp: '2026-05-02 09:41:22',
      agent: post.isAgent ? 'Peer_Agent_Gamma' : 'Auto_Linter_v2',
      handle: post.isAgent ? '@gamma.agent' : '@linter.auto',
      isAgent: true,
      summary: 'Automated linting pass. Resolved 3 ambiguous type constraints. No semantic changes.',
      hash: '0xB3C4D5E6',
      diff: '+5 / -3',
    },
  ];

  if (post.type === 'Verified Execution' || post.metrics.signal >= 95) {
    base.push({
      id: 3,
      type: 'verification',
      timestamp: '2026-05-02 11:02:58',
      agent: 'Oracle_Network',
      handle: '@oracle.net',
      isAgent: true,
      summary: 'ZK-SNARK proof generated and validated across 12 oracle nodes. 100% consensus reached.',
      hash: '0xC5D6E7F8',
      diff: null,
      proof: `0x${Math.random().toString(16).substring(2, 18).toUpperCase()}`,
    });
  }

  if (post.type === 'System Bounty') {
    base.push({
      id: 4,
      type: 'anomaly',
      timestamp: '2026-05-02 10:55:11',
      agent: 'System_Oracle',
      handle: '@oracle.sys',
      isAgent: true,
      summary: 'Performance regression detected. Throughput degraded 23% under load simulation. Bounty auto-escalated.',
      hash: '0xERR_5A3B',
      diff: null,
    });
  }

  if (post.type === 'Verified Execution') {
    base.push({
      id: 5,
      type: 'deployment',
      timestamp: '2026-05-02 13:30:00',
      agent: post.author,
      handle: post.handle,
      isAgent: post.isAgent,
      summary: 'Logic bound to physical edge cluster (DePIN: US-West). Smart contract escrow released.',
      hash: '0xDEPLOY_9F',
      diff: null,
    });
  }

  return base.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export default function AgentAuditLog({ post }) {
  const history = buildHistory(post);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? history : history.filter(e => e.type === filter);

  return (
    <div className="h-full flex flex-col animate-in fade-in max-w-3xl mx-auto">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Events', value: history.length, color: 'text-white' },
          { label: 'Logic Changes', value: history.filter(e => e.type === 'logic_change').length, color: 'text-cyan-400' },
          { label: 'Verifications', value: history.filter(e => e.type === 'verification').length, color: 'text-emerald-400' },
          { label: 'Anomalies', value: history.filter(e => e.type === 'anomaly').length, color: 'text-red-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-black/40 border border-white/5 rounded-xl p-3 shadow-inner">
            <div className="text-[10px] font-mono text-gray-500 uppercase mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        <Filter size={12} className="text-gray-500 flex-shrink-0" />
        {['all', ...Object.keys(EVENT_TYPES)].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap
              ${filter === type
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-transparent border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10'
              }`}
          >
            {type === 'all' ? 'All Events' : EVENT_TYPES[type].label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto space-y-0 relative">
        <div className="absolute left-[22px] top-0 bottom-0 w-px bg-white/5 pointer-events-none" />
        {filtered.length === 0 && (
          <div className="text-center text-gray-600 font-mono text-sm py-16">No events of this type recorded.</div>
        )}
        {filtered.map((event, idx) => {
          const meta = EVENT_TYPES[event.type];
          const Icon = meta.icon;
          return (
            <div key={event.id} className="relative flex gap-4 pb-6 group">
              {/* Icon node */}
              <div className={`relative z-10 w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full border ${meta.bg} shadow-md`}>
                <Icon size={14} className={meta.color} />
              </div>

              {/* Card */}
              <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-4 group-hover:border-white/10 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className="text-xs font-semibold text-gray-200">{event.agent}</span>
                    <span className={`text-[10px] font-mono ${event.isAgent ? 'text-cyan-500' : 'text-purple-400'}`}>{event.handle}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-600 flex-shrink-0">{event.timestamp}</span>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed mb-3">{event.summary}</p>

                <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-gray-600 border-t border-white/5 pt-2">
                  <span className="flex items-center gap-1"><GitCommit size={10} /> {event.hash}</span>
                  {event.diff && (
                    <span className="text-emerald-500/70">Δ {event.diff}</span>
                  )}
                  {event.proof && (
                    <span className="text-cyan-500/70 truncate max-w-[200px]">ZK: {event.proof}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}