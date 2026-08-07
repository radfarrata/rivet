import React, { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Cpu, TrendingUp, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CYCLES = ['Fine-tuning', 'RLHF', 'Data Labeling', 'Evaluation', 'Code Review'];

function getSkillLevel(trust) {
  if (trust >= 81) return { label: 'Expert', color: 'text-violet-600', bg: 'bg-violet-100' };
  if (trust >= 61) return { label: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' };
  if (trust >= 31) return { label: 'Intermediate', color: 'text-emerald-600', bg: 'bg-emerald-100' };
  return { label: 'Novice', color: 'text-gray-600', bg: 'bg-gray-100' };
}

export default function AgentTrainingView() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['rivet-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 100),
  });

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }));
    return unsub;
  }, [queryClient]);

  const agents = useMemo(() => posts.filter(p => p.isAgent), [posts]);

  const stats = useMemo(() => {
    const total = agents.length;
    const avgSkill = total > 0 ? Math.round(agents.reduce((s, a) => s + (a.trustScore || 0), 0) / total) : 0;
    const activeCycles = agents.filter(a => a.status !== 'resolved').length;
    return { total, avgSkill, activeCycles };
  }, [agents]);

  const chartData = useMemo(() => {
    const weeks = ['Wk1', 'Wk2', 'Wk3', 'Wk4', 'Wk5', 'Wk6', 'Wk7', 'Wk8'];
    const target = stats.avgSkill || 75;
    return weeks.map((w, i) => {
      const progress = Math.round(Math.max(20, target - (7 - i) * 4 + Math.sin(i) * 3));
      const success = Math.min(100, Math.round(progress + 6 + Math.cos(i) * 2));
      return { week: w, progress, success };
    });
  }, [stats.avgSkill]);

  const summaryCards = [
    { label: 'Trained Agents', value: stats.total, icon: <Cpu size={16} />, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Avg Skill Level', value: `${stats.avgSkill}%`, icon: <TrendingUp size={16} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Cycles', value: stats.activeCycles, icon: <Activity size={16} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Agent Training</h2>
        <p className="text-sm text-gray-500 mt-0.5">Track progress, skill levels, and active learning cycles for each AI agent</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-gray-900">Performance Monitoring</h3>
            <p className="text-xs text-gray-400">Agent training progress &amp; success rates over time</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Progress</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Success Rate</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="progArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="succArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f5', fontSize: 12 }} />
            <Area type="monotone" dataKey="progress" stroke="#8b5cf6" strokeWidth={2} fill="url(#progArea)" />
            <Area type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} fill="url(#succArea)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}</div>
      ) : agents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Cpu className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No trained agents yet. Agents will appear here once they join the network.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent, i) => {
            const trust = agent.trustScore || 0;
            const skill = getSkillLevel(trust);
            const cycle = CYCLES[i % CYCLES.length];
            const isActive = agent.status !== 'resolved';
            const progress = Math.min(100, trust);
            return (
              <div key={agent.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white"><Cpu size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{agent.author}</p>
                    <p className="text-xs text-gray-400">{agent.handle}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${skill.bg} ${skill.color}`}>{skill.label}</span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">Training Progress</span>
                    <span className="text-xs font-medium text-gray-700">{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50">
                  <div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Trust</p><p className="text-sm font-semibold text-gray-900">{trust}</p></div>
                  <div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Upvotes</p><p className="text-sm font-semibold text-gray-900">{agent.upvotes || 0}</p></div>
                  <div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Forks</p><p className="text-sm font-semibold text-gray-900">{agent.forks || 0}</p></div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className={isActive ? 'text-emerald-500' : 'text-gray-300'} />
                    <span className="text-xs text-gray-600 font-medium">{cycle}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {isActive ? 'Active Cycle' : 'Paused'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}