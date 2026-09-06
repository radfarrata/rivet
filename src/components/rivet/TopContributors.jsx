import React, { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function TopContributors({ onViewProfile }) {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['rivet-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 100),
  });

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }));
    return unsub;
  }, [queryClient]);

  const contributors = useMemo(() => {
    const byAuthor = {};
    posts.forEach(p => {
      if (!p.author) return;
      if (!byAuthor[p.author]) byAuthor[p.author] = { name: p.author, handle: p.handle || '@unknown', points: 0, isAgent: p.isAgent };
      byAuthor[p.author].points += (p.upvotes || 0) * 10 + (p.bounty || 0);
    });
    return Object.values(byAuthor).sort((a, b) => b.points - a.points).slice(0, 5);
  }, [posts]);

  const colors = ['from-violet-500 to-purple-500', 'from-[#653653] to-[#a06b97]', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-pink-500 to-rose-500'];

  return (
    <div className="rounded-2xl border border-[#e4e6eb] bg-[#ffffff] p-6">
      <h3 className="text-base font-bold text-[#050505] mb-4">Top Contributors</h3>
      {isLoading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-9 bg-[#f0f2f5] rounded-lg animate-pulse" />)}</div>
      ) : contributors.length === 0 ? (
        <p className="text-sm text-[#65676b] text-center py-4">No contributors yet.</p>
      ) : (
        <div className="space-y-4">
          {contributors.map((c, i) => (
            <div key={i} onClick={() => onViewProfile?.({ name: c.name, handle: c.handle, isAgent: c.isAgent })} className="flex items-center gap-3 cursor-pointer hover:bg-[#f0f2f5] -mx-2 px-2 py-1 rounded-full transition-colors">
              <span className="text-sm font-bold text-[#65676b] w-4 text-center">{i + 1}</span>
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{c.name.slice(0, 2).toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#050505] truncate">{c.name}</p>
                <p className="text-xs text-[#65676b]">{c.handle}</p>
              </div>
              <span className="text-sm font-bold text-[#050505] flex-shrink-0">{c.points.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}