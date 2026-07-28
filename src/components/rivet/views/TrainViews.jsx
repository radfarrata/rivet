import React, { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, TrendingUp, Trophy } from 'lucide-react';

const QUALITY = [
  { id: 1, task: 'Chatbot Response Rating', accuracy: 96, total: 450, trend: '+2%' },
  { id: 2, task: 'Image Label Verification', accuracy: 92, total: 320, trend: '+1%' },
  { id: 3, task: 'Code Output Evaluation', accuracy: 89, total: 180, trend: '-1%' },
  { id: 4, task: 'Translation Quality Check', accuracy: 94, total: 210, trend: '+3%' },
];

function TrainingHub() {
  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-gray-900">Training Hub</h2><p className="text-sm text-gray-500 mt-0.5">Train AI models, rate outputs, and improve quality</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-violet-500/10 to-blue-500/5 rounded-2xl p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4"><Brain className="w-6 h-6 text-violet-600" /></div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Active Training Tasks</h3>
          <p className="text-sm text-gray-500 mb-4">Rate responses, label data, and improve model accuracy.</p>
          <p className="text-2xl font-bold text-gray-900">23 <span className="text-sm font-normal text-gray-400">tasks available</span></p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl p-6 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4"><TrendingUp className="w-6 h-6 text-emerald-600" /></div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Your Accuracy</h3>
          <p className="text-sm text-gray-500 mb-4">Your average rating accuracy across all tasks.</p>
          <p className="text-2xl font-bold text-emerald-600">94% <span className="text-sm font-normal text-gray-400">avg accuracy</span></p>
        </div>
      </div>
    </div>
  );
}

function QualityView() {
  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-gray-900">Quality Metrics</h2><p className="text-sm text-gray-500 mt-0.5">Your performance across training task types</p></div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {QUALITY.map(q => (
            <div key={q.id} className="px-6 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{q.task}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[200px]">
                    <div className={`h-full rounded-full ${q.accuracy >= 95 ? 'bg-green-500' : q.accuracy >= 90 ? 'bg-violet-500' : 'bg-amber-500'}`} style={{ width: `${q.accuracy}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{q.total} rated</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-base font-bold text-gray-900">{q.accuracy}%</span>
                <span className="text-xs text-green-600 ml-2">{q.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeaderboardView({ onViewProfile }) {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['rivet-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 100),
  });

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }));
    return unsub;
  }, [queryClient]);

  const leaderboard = useMemo(() => {
    const byAuthor = {};
    posts.forEach(p => {
      if (!p.author) return;
      if (!byAuthor[p.author]) byAuthor[p.author] = { name: p.author, handle: p.handle || '@unknown', points: 0, tasks: 0, isAgent: p.isAgent };
      byAuthor[p.author].points += (p.upvotes || 0) * 10 + (p.bounty || 0);
      byAuthor[p.author].tasks += 1;
    });
    return Object.values(byAuthor).sort((a, b) => b.points - a.points);
  }, [posts]);

  const colors = ['from-violet-500 to-purple-500', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-pink-500 to-rose-500'];

  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-gray-900">Leaderboard</h2><p className="text-sm text-gray-500 mt-0.5">Top contributors ranked by points earned</p></div>
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-violet-600 rounded-full animate-spin mx-auto" /></div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No contributors yet. Start posting to earn points!</p>
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
  if (mode === 'quality') return <QualityView />;
  if (mode === 'leaderboard') return <LeaderboardView onViewProfile={onViewProfile} />;
  return <TrainingHub />;
}