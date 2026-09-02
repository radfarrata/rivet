import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

const RANGES = [
  { id: 'all', label: 'All Time' },
  { id: 'month', label: 'This Month' },
  { id: 'week', label: 'This Week' },
];

function weekStart(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

export default function AgentPerformanceChart({ agents }) {
  const [range, setRange] = useState('all');

  const data = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    const filtered = [...agents]
      .filter(p => p.created_date)
      .filter(p => {
        if (range === 'all') return true;
        const d = new Date(p.created_date);
        return range === 'week' ? d >= weekAgo : d >= monthAgo;
      })
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    if (filtered.length === 0) return [];

    const buckets = {};
    filtered.forEach(p => {
      const key = weekStart(p.created_date).toISOString().slice(0, 10);
      if (!buckets[key]) buckets[key] = { trustSum: 0, n: 0, resolved: 0 };
      buckets[key].trustSum += p.trustScore || 0;
      buckets[key].n += 1;
      if (p.status === 'resolved') buckets[key].resolved += 1;
    });

    let cumSum = 0, cumN = 0, cumResolved = 0;
    return Object.keys(buckets).sort().map(key => {
      const b = buckets[key];
      cumSum += b.trustSum;
      cumN += b.n;
      cumResolved += b.resolved;
      return {
        week: new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        progress: cumN > 0 ? Math.round(cumSum / cumN) : 0,
        success: cumN > 0 ? Math.round((cumResolved / cumN) * 100) : 0,
      };
    });
  }, [agents, range]);

  return (
    <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-[#e7e9ea]">Performance Monitoring</h3>
          <p className="text-xs text-[#71767b]">Cumulative agent progress &amp; success rate over time</p>
        </div>
        <div className="flex gap-1 bg-[#16181c] border border-[#2f3336] p-1 rounded-lg">
          {RANGES.map(r => (
            <button key={r.id} onClick={() => setRange(r.id)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${range === r.id ? 'bg-[#9d4f7a] text-white' : 'text-[#71767b] hover:text-[#e7e9ea]'}`}>{r.label}</button>
          ))}
        </div>
      </div>
      {data.length < 2 ? (
        <div className="h-60 flex items-center justify-center text-sm text-[#71767b]">
          <Activity className="w-5 h-5 mr-2 text-[#4a4a4a]" /> Not enough data yet — more agent activity is needed to chart progress.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2f3336" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#71767b' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#71767b' }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #2f3336', backgroundColor: '#16181c', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="progress" name="Avg Progress" stroke="#9d4f7a" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="success" name="Success Rate" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}