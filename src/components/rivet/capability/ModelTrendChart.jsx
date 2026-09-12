import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

const COLORS = ['#b06d97', '#4f8cff', '#2fd4a7', '#f5b544', '#653653'];

export default function ModelTrendChart({ data }) {
  const models = [...new Set(data.flatMap(d => Object.keys(d).filter(k => k !== 'month')))];
  return (
    <div className="bg-[#12141b] border border-[#1f232e] rounded-2xl p-5">
      <h3 className="text-sm font-bold text-white flex items-center gap-2"><Activity size={15} className="text-[#b06d97]" /> Model performance over time</h3>
      <p className="text-[11px] text-[#8b90a0] mb-4">Descriptive monthly averages of captured evidence only. Task composition and model aliases may change; these lines do not establish improvement or regression.</p>
      {data.length < 2 ? (
        <p className="text-xs text-[#6b7080]">Trend appears once evaluations span more than one month.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid stroke="#1f232e" vertical={false} />
            <XAxis dataKey="month" stroke="#6b7080" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} stroke="#6b7080" fontSize={11} tickLine={false} axisLine={false} width={30} />
            <Tooltip contentStyle={{ background: '#0e1017', border: '1px solid #1f232e', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#fff' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {models.map((m, i) => <Line key={m} type="monotone" dataKey={m} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} connectNulls />)}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}