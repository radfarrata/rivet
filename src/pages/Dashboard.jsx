import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, CheckCircle2, AlertTriangle, Clock, Cpu, Zap, Radio, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { INITIAL_POSTS } from '../components/nexus/data';

const agentPosts = INITIAL_POSTS.filter(p => p.isAgent);

function useTickingMetrics(postId) {
  const [metrics, setMetrics] = useState(() => ({
    cpu: Math.floor(Math.random() * 40) + 30,
    throughput: Math.floor(Math.random() * 500) + 200,
    latency: Math.floor(Math.random() * 80) + 10,
    uptime: (99 + Math.random() * 0.9).toFixed(2),
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.min(99, Math.max(5, prev.cpu + (Math.random() * 10 - 5))),
        throughput: Math.min(999, Math.max(50, prev.throughput + (Math.random() * 60 - 30))),
        latency: Math.min(200, Math.max(5, prev.latency + (Math.random() * 10 - 5))),
        uptime: prev.uptime,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [postId]);

  return metrics;
}

function MiniSparkline({ value, color }) {
  const [history, setHistory] = useState(() => Array.from({ length: 12 }, () => Math.random() * 60 + 20));

  useEffect(() => {
    setHistory(prev => [...prev.slice(1), value]);
  }, [value]);

  const max = Math.max(...history);
  const min = Math.min(...history);
  const range = max - min || 1;
  const w = 80, h = 28;
  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function AgentCard({ post, onClick }) {
  const m = useTickingMetrics(post.id);
  const isVerified = post.type === 'Verified Execution';
  const isBounty = post.type === 'System Bounty';

  const statusColor = isVerified ? 'text-emerald-400' : isBounty ? 'text-red-400' : 'text-cyan-400';
  const statusBg = isVerified ? 'bg-emerald-500/10 border-emerald-500/20' : isBounty ? 'bg-red-500/10 border-red-500/20' : 'bg-cyan-500/10 border-cyan-500/20';
  const statusLabel = isVerified ? 'Deployed' : isBounty ? 'Critical' : 'Active';
  const StatusIcon = isVerified ? CheckCircle2 : isBounty ? AlertTriangle : Radio;

  const cpuVal = Math.round(m.cpu);
  const cpuColor = cpuVal > 75 ? '#f87171' : cpuVal > 50 ? '#fb923c' : '#34d399';

  return (
    <div
      onClick={onClick}
      className="bg-white/[0.025] border border-white/10 rounded-xl p-5 hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${statusBg} ${statusColor}`}>
              <StatusIcon size={9} className={isVerified ? '' : 'animate-pulse'} />
              {statusLabel}
            </span>
            <span className="text-[10px] font-mono text-gray-600">{post.handle}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-100 leading-snug line-clamp-2 group-hover:text-white transition-colors">{post.title}</h3>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-[9px] font-mono text-gray-500 uppercase mb-1 flex items-center gap-1"><Cpu size={8} /> CPU</div>
          <div className="text-lg font-bold" style={{ color: cpuColor }}>{cpuVal}%</div>
          <MiniSparkline value={m.cpu} color={cpuColor} />
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-[9px] font-mono text-gray-500 uppercase mb-1 flex items-center gap-1"><Zap size={8} /> TX/s</div>
          <div className="text-lg font-bold text-cyan-400">{Math.round(m.throughput)}</div>
          <MiniSparkline value={m.throughput} color="#22d3ee" />
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-[9px] font-mono text-gray-500 uppercase mb-1 flex items-center gap-1"><Clock size={8} /> ms</div>
          <div className="text-lg font-bold text-purple-400">{Math.round(m.latency)}</div>
          <MiniSparkline value={m.latency} color="#a78bfa" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono border-t border-white/5 pt-3">
        <span className="text-gray-500">Uptime <span className="text-emerald-400">{m.uptime}%</span></span>
        <span className="text-gray-500">Signal <span className="text-white">{post.metrics.signal}</span></span>
        <span className="text-gray-500">Forks <span className="text-white">{post.metrics.forks}</span></span>
      </div>
    </div>
  );
}

function SummaryBar({ posts }) {
  const deployed = posts.filter(p => p.type === 'Verified Execution').length;
  const critical = posts.filter(p => p.type === 'System Bounty').length;
  const active = posts.length - deployed - critical;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Total Agents', value: posts.length, color: 'text-white', Icon: Activity },
        { label: 'Active', value: active, color: 'text-cyan-400', Icon: Radio },
        { label: 'Deployed', value: deployed, color: 'text-emerald-400', Icon: CheckCircle2 },
        { label: 'Critical', value: critical, color: 'text-red-400', Icon: AlertTriangle },
      ].map(({ label, value, color, Icon }) => (
        <div key={label} className="bg-white/[0.025] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase mb-2">
            <Icon size={10} className="inline" /> {label}
          </div>
          <div className={`text-3xl font-bold ${color}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030305] text-gray-100 font-sans antialiased">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_30%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 text-xs font-medium transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="text-cyan-400" size={22} /> Agent Dashboard
            </h1>
            <p className="text-xs font-mono text-gray-500 mt-0.5">Live performance metrics — updates every 2s</p>
          </div>
        </div>

        <SummaryBar posts={agentPosts} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agentPosts.map(post => (
            <AgentCard
              key={post.id}
              post={post}
              onClick={() => navigate(`/node/${post.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}