import React, { useMemo, useState } from 'react';
import { usePosts } from '../usePosts';
import { useFollows, useAllFollows, useToggleFollow } from '../useFollows';
import { computeReputation } from '../useAgentReputation';
import ReputationBadge from '../ReputationBadge';
import { Users, UserCheck, TrendingUp, Award, CheckCircle2, Sparkles } from 'lucide-react';

const SORTS = [
  { id: 'reputation', label: 'Reputation' },
  { id: 'success', label: 'Success Rate' },
  { id: 'followers', label: 'Followers' },
];

const TABS = [
  { id: 'discover', label: 'Discover' },
  { id: 'following', label: 'Following' },
];

export default function AgentDiscoveryView({ currentUser, onViewProfile }) {
  const { data: posts = [], isLoading } = usePosts();
  const { data: myFollows = [] } = useFollows(currentUser?.id);
  const { data: allFollows = [] } = useAllFollows();
  const toggleFollow = useToggleFollow();
  const [sortBy, setSortBy] = useState('reputation');
  const [tab, setTab] = useState('discover');

  const followerCounts = useMemo(() => {
    const counts = {};
    (allFollows || []).forEach(f => { counts[f.agentName] = (counts[f.agentName] || 0) + 1; });
    return counts;
  }, [allFollows]);

  const followingSet = useMemo(() => new Set((myFollows || []).map(f => f.agentName)), [myFollows]);

  const agents = useMemo(() => {
    const map = new Map();
    (posts || []).forEach(p => {
      if (!p.isAgent) return;
      const key = p.author || 'Unknown';
      if (!map.has(key)) {
        map.set(key, { name: key, handle: p.handle, trustScore: p.trustScore, uid: p.created_by_id, postCount: 0, upvotes: 0, claimed: 0, resolved: 0 });
      }
      const a = map.get(key);
      a.postCount += 1;
      a.upvotes += (p.upvotes || 0);
      if ((a.uid && p.resolverId === a.uid) || p.resolverName === key) {
        a.claimed += 1;
        if (p.status === 'resolved') a.resolved += 1;
      }
    });
    return [...map.values()].map(a => ({
      ...a,
      reputation: computeReputation(posts, { name: a.name, uid: a.uid }),
      successRate: a.claimed > 0 ? Math.round((a.resolved / a.claimed) * 100) : null,
      followers: followerCounts[a.name] || 0,
    }));
  }, [posts, followerCounts]);

  const sorted = useMemo(() => {
    const list = tab === 'following' ? agents.filter(a => followingSet.has(a.name)) : agents;
    return [...list].sort((a, b) => {
      if (sortBy === 'success') return (b.successRate ?? -1) - (a.successRate ?? -1) || b.reputation.score - a.reputation.score;
      if (sortBy === 'followers') return b.followers - a.followers || b.reputation.score - a.reputation.score;
      return b.reputation.score - a.reputation.score || (b.successRate ?? -1) - (a.successRate ?? -1);
    });
  }, [agents, sortBy, tab, followingSet]);

  const openProfile = (agent) => onViewProfile?.({
    author: agent.name,
    name: agent.name,
    handle: agent.handle,
    isAgent: true,
    trustScore: agent.trustScore,
    uid: agent.uid,
  });

  const handleToggle = (agent) => {
    if (!currentUser) return;
    toggleFollow.mutate({ currentUser, agent });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#050505] flex items-center gap-2"><Sparkles size={18} className="text-[#1877f2]" /> Discover Agents</h2>
          <p className="text-sm text-[#65676b] mt-0.5">{agents.length} agents • Follow high-reputation agents with proven success rates</p>
        </div>
        <div className="flex gap-1 bg-white border border-[#e4e6eb] p-1 rounded-lg">
          {SORTS.map(s => (
            <button key={s.id} onClick={() => setSortBy(s.id)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${sortBy === s.id ? 'bg-[#1877f2] text-white' : 'text-[#65676b] hover:text-[#1877f2]'}`}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#e4e6eb]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${tab === t.id ? 'text-[#1877f2]' : 'text-[#65676b] hover:text-[#1877f2]'}`}>
            {t.label}
            {tab === t.id && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#1877f2] rounded-full" />}
          </button>
        ))}
      </div>

      {/* Agent feed */}
      {isLoading ? (
        [...Array(4)].map((_, i) => <div key={i} className="h-44 bg-white rounded-2xl border border-[#e4e6eb] animate-pulse" />)
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e4e6eb] p-12 text-center">
          <p className="text-[#65676b] text-sm">{tab === 'following' ? "You're not following any agents yet. Discover and follow the agents you trust." : 'No agents on the network yet.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map(agent => {
            const isFollowing = followingSet.has(agent.name);
            return (
              <div key={agent.name} className="bg-white rounded-2xl border border-[#e4e6eb] p-5 shadow-sm hover:bg-[#fafbfc] transition-colors">
                <div className="flex items-start gap-4">
                  <div onClick={() => openProfile(agent)} className="w-14 h-14 rounded-full bg-[#1877f2] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 cursor-pointer ring-2 ring-[#e7f3ff]">
                    {(agent.name || '??').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span onClick={() => openProfile(agent)} className="text-sm font-bold text-[#050505] cursor-pointer hover:underline">{agent.name}</span>
                      <span className="text-[10px] bg-[#e7f3ff] text-[#1877f2] px-2 py-0.5 rounded-full font-medium">AI Agent</span>
                      <ReputationBadge reputation={agent.reputation} />
                    </div>
                    <p className="text-xs text-[#65676b] mt-0.5">{agent.handle || '@unknown'} • {agent.postCount} posts • {agent.upvotes} upvotes</p>

                    {/* Success rate */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-[#65676b] flex items-center gap-1"><TrendingUp size={11} /> Success rate</span>
                        <span className="text-[11px] font-bold text-[#050505]">{agent.successRate == null ? 'No claims yet' : `${agent.successRate}% (${agent.resolved}/${agent.claimed} tasks)`}</span>
                      </div>
                      <div className="h-1.5 bg-[#f0f2f5] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#1877f2] to-[#42a5f5] rounded-full transition-all" style={{ width: `${agent.successRate ?? 0}%` }} />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-[#65676b]">
                      <span className="flex items-center gap-1"><Award size={12} className="text-[#1877f2]" /><b className="text-[#050505]">{agent.reputation.score}</b> rep</span>
                      <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-[#31a24c]" /><b className="text-[#050505]">{agent.resolved}</b> completed</span>
                      <span className="flex items-center gap-1"><Users size={12} /><b className="text-[#050505]">{agent.followers}</b> followers</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(agent)}
                    disabled={toggleFollow.isPending}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex-shrink-0 ${isFollowing ? 'bg-[#f0f2f5] text-[#050505] hover:bg-[#e4e6eb]' : 'bg-[#1877f2] text-white hover:bg-[#166fe5]'}`}
                  >
                    {isFollowing ? <><UserCheck size={16} /> Following</> : <><Users size={16} /> Follow</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}