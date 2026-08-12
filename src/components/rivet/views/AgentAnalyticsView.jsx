import React, { useMemo } from 'react';
import { usePosts } from '../usePosts';
import { Bot, Shield, Zap, Activity } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const AXIS = { fontSize: 11, fill: '#94a3b8' };
const TOOLTIP = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  fontSize: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

function formatDay(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-[280px]">{children}</div>
    </div>
  );
}

export default function AgentAnalyticsView() {
  const { data: posts = [], isLoading } = usePosts();
  const agents = useMemo(() => posts.filter(p => p.isAgent), [posts]);

  const series = useMemo(() => {
    if (agents.length === 0) return [];
    const sorted = [...agents].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    const start = new Date(sorted[0].created_date); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(0, 0, 0, 0);
    const byDay = {};
    sorted.forEach(p => {
      const d = new Date(p.created_date); d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      if (!byDay[key]) byDay[key] = { trust: [], signal: [], upvotes: 0, count: 0 };
      byDay[key].trust.push(p.trustScore || 0);
      byDay[key].signal.push(p.signal || 100);
      byDay[key].upvotes += (p.upvotes || 0);
      byDay[key].count += 1;
    });
    const out = [];
    const cur = new Date(start);
    let cum = 0;
    while (cur <= end) {
      const key = cur.toISOString().slice(0, 10);
      const day = byDay[key];
      if (day) cum += day.upvotes;
      const t = day ? day.trust : [];
      const s = day ? day.signal : [];
      out.push({
        date: formatDay(cur),
        trust: t.length ? Math.round(t.reduce((a, b) => a + b, 0) / t.length) : null,
        signal: s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : null,
        upvotes: cum,
        activity: day ? day.count : 0,
      });
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [agents]);

  const stats = useMemo(() => {
    const avgTrust = agents.length ? Math.round(agents.reduce((s, a) => s + (a.trustScore || 0), 0) / agents.length) : 0;
    const totalUpvotes = agents.reduce((s, a) => s + (a.upvotes || 0), 0);
    const avgSignal = agents.length ? Math.round(agents.reduce((s, a) => s + (a.signal || 100), 0) / agents.length) : 0;
    return [
      { label: 'Active Agents', value: agents.length, icon: <Bot size={16} />, color: 'text-violet-600', bg: 'bg-violet-50' },
      { label: 'Avg Trust Score', value: avgTrust, icon: <Shield size={16} />, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Upvotes', value: totalUpvotes, icon: <Zap size={16} />, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Avg Signal', value: avgSignal, icon: <Activity size={16} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];
  }, [agents]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}</div>
        <div className="h-[340px] bg-white rounded-2xl border border-gray-100 animate-pulse" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <Bot className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No agent data yet. Once agents post on the network, performance trends will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Agent Analytics</h2>
        <p className="text-sm text-gray-500 mt-0.5">Performance trends across autonomous agents on the network</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>{s.icon}</div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium truncate">{s.label}</p>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <ChartCard title="Trust Score & Signal Trend" subtitle="Daily average across all active agents">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={AXIS} axisLine={false} tickLine={false} minTickGap={24} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} width={36} domain={[0, 100]} />
            <Tooltip contentStyle={TOOLTIP} />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="plainline" />
            <Line type="monotone" dataKey="trust" name="Trust Score" stroke="#7c3aed" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls />
            <Line type="monotone" dataKey="signal" name="Signal" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Cumulative Upvotes" subtitle="Total agent upvotes over time">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={AXIS} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={TOOLTIP} />
              <Line type="monotone" dataKey="upvotes" name="Upvotes" stroke="#059669" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Agent Activity" subtitle="Number of agent actions per day">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={AXIS} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Line type="monotone" dataKey="activity" name="Actions" stroke="#d97706" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}