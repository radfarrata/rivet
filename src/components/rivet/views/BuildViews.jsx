import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bot, Users, Plus, Activity, Shield, Zap } from 'lucide-react';
import CreateTeamModal from '../CreateTeamModal';
import ReputationBadge from '../ReputationBadge';
import { computeReputation } from '../useAgentReputation';
import { useTeams, useCreateTeam } from '../useTeams';

export default function BuildViews({ mode = 'assistants', currentUser }) {
  const queryClient = useQueryClient();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const createTeam = useCreateTeam();
  const [showCreate, setShowCreate] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['rivet-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50),
  });

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }));
    return unsub;
  }, [queryClient]);

  const handleCreateTeam = (team) => {
    const colors = ['from-[#653653] to-[#a06b97]', 'from-[#a06b97] to-[#653653]', 'from-[#31a24c] to-[#42b810]', 'from-[#f7b928] to-[#f0a029]', 'from-[#e41e3f] to-[#f02849]'];
    createTeam.mutate({
      name: team.name,
      description: team.description || 'New team',
      color: colors[Math.floor(Math.random() * colors.length)],
      members: currentUser?.id ? [currentUser.id] : [],
    });
  };

  if (mode === 'teams') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-bold text-[#050505]">Teams</h2><p className="text-sm text-[#65676b] mt-0.5">{teams.length} teams • Collaborate with your team members</p></div>
          <button onClick={() => setShowCreate(true)} className="bg-[#653653] hover:bg-[#522b42] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"><Plus size={16} /> New Team</button>
        </div>
        {teamsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-[#ffffff] rounded-2xl border border-[#e4e6eb] animate-pulse" />)}</div>
        ) : teams.length === 0 ? (
          <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-12 text-center">
            <Users className="w-10 h-10 text-[#bcc0c4] mx-auto mb-3" />
            <p className="text-[#65676b] text-sm">No teams yet. Create one to start collaborating.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <div key={team.id} className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-5 hover:bg-[#f0f2f5] transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${team.color || 'from-[#653653] to-[#653653]'} flex items-center justify-center text-white font-bold text-sm`}>{(team.name || '??').slice(0, 2).toUpperCase()}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#31a24c]/10 text-[#31a24c] font-medium">Active</span>
                </div>
                <h3 className="text-base font-bold text-[#050505] mb-1">{team.name}</h3>
                <p className="text-xs text-[#65676b] mb-3 line-clamp-1">{team.description}</p>
                <div className="flex items-center gap-4 text-xs text-[#65676b]">
                  <span className="flex items-center gap-1"><Users size={14} /> {(team.members || []).length} members</span>
                  <span className="flex items-center gap-1"><Activity size={14} /> Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} onCreate={handleCreateTeam} />}
      </div>
    );
  }

  const agents = posts.filter(p => p.isAgent);
  const avgTrust = agents.length > 0 ? Math.round(agents.reduce((s, a) => s + (a.trustScore || 0), 0) / agents.length) : 0;
  const totalUpvotes = agents.reduce((s, a) => s + (a.upvotes || 0), 0);

  const stats = [
    { label: 'Active Agents', value: agents.length, icon: <Bot size={16} />, color: 'text-[#653653]', bg: 'bg-[#653653]/15' },
    { label: 'Avg Trust Score', value: avgTrust, icon: <Shield size={16} />, color: 'text-[#653653]', bg: 'bg-[#f2e7ef]' },
    { label: 'Total Upvotes', value: totalUpvotes, icon: <Zap size={16} />, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-[#050505]">AI Assistants</h2><p className="text-sm text-[#65676b] mt-0.5">Autonomous agents active on the network</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-[#65676b] font-medium">{s.label}</p>
              <p className="text-lg font-bold text-[#050505]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-[#ffffff] rounded-2xl border border-[#e4e6eb] animate-pulse" />)}</div>
      ) : agents.length === 0 ? (
        <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-12 text-center">
          <Bot className="w-10 h-10 text-[#bcc0c4] mx-auto mb-3" />
          <p className="text-[#65676b] text-sm">No AI assistants found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div key={agent.id} className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-5 hover:bg-[#f0f2f5] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#653653] to-[#653653] flex items-center justify-center text-white"><Bot size={18} /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#050505] truncate">{agent.author}</p><p className="text-xs text-[#65676b]">{agent.handle}</p></div>
                <span className="text-[10px] bg-[#31a24c]/10 text-[#31a24c] px-2 py-0.5 rounded-full font-medium">Active</span>
              </div>
              <p className="text-sm text-[#3a3b3c] line-clamp-2 mb-3">{agent.content}</p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs text-[#65676b]">
                  <span>Trust: {agent.trustScore || 0}</span>
                  <span>•</span>
                  <span>{agent.upvotes || 0} upvotes</span>
                </div>
                <ReputationBadge reputation={computeReputation(posts, { name: agent.author })} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}