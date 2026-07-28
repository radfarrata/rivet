import React, { useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTransactions } from './useTransactions';

export default function DashboardWidgets() {
  const queryClient = useQueryClient();
  const { data: posts = [] } = useQuery({
    queryKey: ['rivet-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 100),
  });
  const { data: transactions = [] } = useTransactions();

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }));
    return unsub;
  }, [queryClient]);

  const tasksBySyndicate = useMemo(() => {
    const groups = { Design: 0, Development: 0, Training: 0 };
    posts.forEach(p => {
      if (p.syndicate === 'software' || p.syndicate === 'backend') groups.Development++;
      else if (p.syndicate === 'bio' || p.syndicate === 'physics') groups.Training++;
      else groups.Design++;
    });
    return groups;
  }, [posts]);

  const totalTasks = posts.length;
  const taskPct = Math.min(100, (totalTasks / 50) * 100);

  const weekData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const data = days.map(d => ({ day: d, amount: 0 }));
    transactions.forEach(t => {
      if (t.type !== 'earned' || t.status !== 'completed') return;
      const d = new Date(t.created_date);
      const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) data[6 - diffDays].amount += Math.abs(t.amount || 0);
    });
    return data;
  }, [transactions]);

  const weekTotal = weekData.reduce((s, d) => s + d.amount, 0);
  const totalEarnings = transactions.filter(t => t.type === 'earned' && t.status === 'completed').reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const activeProjects = posts.filter(p => p.postType === 'task' && p.status !== 'resolved').slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-4">Your Progress</h3>
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
              <defs>
                <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f0f5" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#progGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={264 - (264 * taskPct) / 100} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-xl font-bold text-gray-900">{totalTasks}</span>
                <p className="text-[10px] text-gray-400">posts</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between"><span className="text-gray-500">Design</span><span className="font-medium text-gray-700">{tasksBySyndicate.Design} tasks</span></div>
          <div className="flex items-center justify-between"><span className="text-gray-500">Development</span><span className="font-medium text-gray-700">{tasksBySyndicate.Development} tasks</span></div>
          <div className="flex items-center justify-between"><span className="text-gray-500">Training</span><span className="font-medium text-gray-700">{tasksBySyndicate.Training} tasks</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-4">Active Projects</h3>
        <div className="space-y-4">
          {activeProjects.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No active projects yet.</p>
          ) : activeProjects.map(p => {
            const pct = p.status === 'pending_approval' ? 60 : 30;
            return (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-800 truncate">{p.title}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 60 ? 'bg-amber-500' : 'bg-violet-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-1">Earnings Overview</h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">{weekTotal.toLocaleString()}</span>
          <span className="text-xs text-gray-400">pts this week</span>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weekData}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">Total earnings</span>
          <span className="text-sm font-bold text-gray-700">{totalEarnings.toLocaleString()} pts</span>
        </div>
      </div>
    </div>
  );
}