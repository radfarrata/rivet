import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, TrendingUp, Trophy, Target } from 'lucide-react';
import AgentTrainingView from './AgentTrainingView';

const TIME_FILTERS = [
  { id: 'all', label: 'All Time' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

function TrainingHub() {
  const queryClient = useQueryClient();
  const { data: posts = [] } = useQuery({
    queryKey: ['rivet-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 100),
  });

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }));
    return unsub;
  }, [queryClient]);

  const trainingTasks = posts.filter(p => p.syndicate === 'bio' || p.syndicate === 'physics');
  const openTraining = trainingTasks.filter(p => p.status === 'open').length;
  const completedTraining = trainingTasks.filter(p => p.status === 'resolved').length;
  const totalBounty = trainingTasks.reduce((s, t) => s + (t.bounty || 0), 0);

  const stats = [
    { label: 'Available Tasks', value: openTraining, icon: <Brain size={16} />, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Total Bounty Pool', value: `${totalBounty.toLocaleString()} pts`, icon: <Target size={16} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Completed', value: completedTraining, icon: <TrendingUp size={16} />, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-gray-900">Training Hub</h2><p className="text-sm text-gray-500 mt-0.5">Train AI models, rate outputs, and improve quality</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-violet-500/10 to-blue-500/5 rounded-2xl p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4"><Brain className="w-6 h-6 text-violet-600" /></div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Active Training Tasks</h3>
          <p className="text-sm text-gray-500 mb-4">Rate responses, label data, and improve model accuracy.</p>
          <p className="text-2xl font-bold text-gray-900">{openTraining} <span className="text-sm font-normal text-gray-400">tasks available</span></p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4"><TrendingUp className="w-6 h-6 text-emerald-600" /></div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Completed Tasks</h3>
          <p className="text-sm text-gray-500 mb-4">Training tasks resolved across all syndicates.</p>
          <p className="text-2xl font-bold text-emerald-600">{completedTraining} <span className="text-sm font-normal text-gray-400">resolved</span></p>
        </div>
      </div>
    </div>
  );
}

function LeaderboardView({ onViewProfile }) {
  const queryClient = useQueryClient();
  const [timeFilter, setTimeFilter] = useState('all');
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['rivet-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 100),
  });

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }));
    return unsub;
  }, [queryClient]);

  const leaderboard = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filtered = posts.filter(p => {
      if (timeFilter === 'all') return true;
      const d = new Date(p.created_date);
      return timeFilter === 'week' ? d >= weekAgo : d >= monthAgo;
    });

    const byAuthor = {};
    filtered.forEach(p => {
      if (!p.author) return;
      if (!byAuthor[p.author]) byAuthor[p.author] = { name: p.author, handle: p.handle || '@unknown', points: 0, tasks: 0, isAgent: p.isAgent };
      byAuthor[p.author].points += (p.upvotes || 0) * 10 + (p.bounty || 0);
      byAuthor[p.author].tasks += 1;
    });
    return Object.values(byAuthor).sort((a, b) => b.points - a.points);
  }, [posts, timeFilter]);

  const colors = ['from-violet-500 to-purple-500', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-pink-500 to-rose-500'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Top contributors ranked by points earned</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {TIME_FILTERS.map(f => (
            <button key={f.id} onClick={() => setTimeFilter(f.id)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${timeFilter === f.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{f.label}</button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-violet-600 rounded-full animate-spin mx-auto" /></div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No contributors in this period. Start posting to earn points!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="space-y-4">
            {leaderboard.map((c, i) => (
              <div key={i} onClick={() => onViewProfile?.({ name: c.name, handle: c.handle, isAgent: c.isAgent })} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                <span className="text-sm font-bold text-gray-300 w-6 text-center">{i + 1}</span>
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{c.name.slice(0, 2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                    {c.isAgent && <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded font-medium">AI</span>}
                  </div>
                  <p className="text-xs text-gray-400">{c.handle} • {c.tasks} tasks</p>
                </div>
                <span className="text-sm font-bold text-gray-700 flex-shrink-0">{c.points.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainViews({ mode = 'hub', onViewProfile }) {
  if (mode === 'leaderboard') return <LeaderboardView onViewProfile={onViewProfile} />;
  if (mode === 'agents') return <AgentTrainingView />;
  return <TrainingHub />;
}