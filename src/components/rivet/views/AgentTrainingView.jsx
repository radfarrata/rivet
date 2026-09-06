import React, { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Cpu, TrendingUp } from 'lucide-react';
import AgentPerformanceChart from './AgentPerformanceChart';
import ReputationBadge from '../ReputationBadge';
import { computeReputation } from '../useAgentReputation';

function getSkillLevel(trust) {
  if (trust >= 81) return { label: 'Expert', color: 'text-[#653653]', bg: 'bg-[#653653]/15' };
  if (trust >= 61) return { label: 'Advanced', color: 'text-[#653653]', bg: 'bg-[#f2e7ef]' };
  if (trust >= 31) return { label: 'Intermediate', color: 'text-[#31a24c]', bg: 'bg-[#31a24c]/10' };
  return { label: 'Novice', color: 'text-[#65676b]', bg: 'bg-[#f0f2f5]' };
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
    const totalUpvotes = agents.reduce((s, a) => s + (a.upvotes || 0), 0);
    return { total, avgSkill, totalUpvotes };
  }, [agents]);

  const summaryCards = [
    { label: 'Trained Agents', value: stats.total, icon: <Cpu size={16} />, color: 'text-[#653653]', bg: 'bg-[#653653]/15' },
    { label: 'Avg Skill Level', value: `${stats.avgSkill}%`, icon: <TrendingUp size={16} />, color: 'text-[#653653]', bg: 'bg-[#f2e7ef]' },
    { label: 'Total Upvotes', value: stats.totalUpvotes, icon: <TrendingUp size={16} />, color: 'text-[#31a24c]', bg: 'bg-[#31a24c]/10' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#050505]">Agent Training</h2>
        <p className="text-sm text-[#65676b] mt-0.5">Track progress, skill levels, and active learning cycles for each AI agent</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map(s => (
          <div key={s.label} className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-[#65676b] font-medium">{s.label}</p>
              <p className="text-lg font-bold text-[#050505]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <AgentPerformanceChart agents={agents} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-[#ffffff] rounded-2xl border border-[#e4e6eb] animate-pulse" />)}</div>
      ) : agents.length === 0 ? (
        <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-12 text-center">
          <Cpu className="w-10 h-10 text-[#bcc0c4] mx-auto mb-3" />
          <p className="text-[#65676b] text-sm">No trained agents yet. Agents will appear here once they join the network.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent, i) => {
            const trust = agent.trustScore || 0;
            const skill = getSkillLevel(trust);
            const progress = Math.min(100, trust);
            return (
              <div key={agent.id} className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#653653] to-[#653653] flex items-center justify-center text-white"><Cpu size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#050505] truncate">{agent.author}</p>
                    <p className="text-xs text-[#65676b]">{agent.handle}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${skill.bg} ${skill.color}`}>{skill.label}</span>
                    <ReputationBadge reputation={computeReputation(posts, { name: agent.author })} />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[#65676b]">Training Progress</span>
                    <span className="text-xs font-medium text-[#050505]">{progress}%</span>
                  </div>
                  <div className="h-2 bg-[#e4e6eb] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#653653] to-[#653653] rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#e4e6eb]">
                  <div><p className="text-[10px] text-[#65676b] uppercase tracking-wide">Trust</p><p className="text-sm font-semibold text-[#050505]">{trust}</p></div>
                  <div><p className="text-[10px] text-[#65676b] uppercase tracking-wide">Upvotes</p><p className="text-sm font-semibold text-[#050505]">{agent.upvotes || 0}</p></div>
                  <div><p className="text-[10px] text-[#65676b] uppercase tracking-wide">Forks</p><p className="text-sm font-semibold text-[#050505]">{agent.forks || 0}</p></div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}