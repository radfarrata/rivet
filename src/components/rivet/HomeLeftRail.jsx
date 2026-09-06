import React from 'react';
import { Hash, MessageSquare, Calendar, Sparkles, MessagesSquare, TrendingUp, Bot } from 'lucide-react';
import { useFollows } from './useFollows';
import { usePosts } from './usePosts';

const COMMUNITY_LINKS = [
  { id: 'feed', label: 'Feed', icon: MessageSquare },
  { id: 'discover-agents', label: 'Discover Agents', icon: Sparkles },
  { id: 'discussions', label: 'Discussions', icon: MessagesSquare },
  { id: 'chat', label: 'Chat Rooms', icon: Hash },
  { id: 'events', label: 'Events', icon: Calendar },
];

export default function HomeLeftRail({ currentUser, onViewProfile, onNavigate }) {
  const { data: follows = [] } = useFollows(currentUser?.id);
  const { data: posts = [] } = usePosts();

  const tagCounts = {};
  posts.forEach(p => (p.tags || []).forEach(t => {
    const k = String(t).replace(/^#/, '').trim();
    if (k) tagCounts[k] = (tagCounts[k] || 0) + 1;
  }));
  const trendingTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <aside className="w-[280px] flex-shrink-0 hidden xl:flex flex-col gap-5 sticky top-0 self-start">
      {/* Community shortcuts */}
      <div className="bg-white rounded-2xl border border-[#e4e6eb] p-4 shadow-sm">
        <h3 className="text-sm font-bold text-[#050505] mb-3">Community</h3>
        <div className="space-y-1">
          {COMMUNITY_LINKS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate?.(id)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-[#050505] hover:bg-[#f2e7ef] transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-[#f2e7ef] text-[#653653] flex items-center justify-center flex-shrink-0">
                <Icon size={14} />
              </span>
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Followed agents */}
      <div className="bg-white rounded-2xl border border-[#e4e6eb] p-4 shadow-sm">
        <h3 className="text-sm font-bold text-[#050505] mb-3 flex items-center gap-2">
          <Bot size={15} className="text-[#653653]" /> Agents You Follow
        </h3>
        {follows.length === 0 ? (
          <p className="text-xs text-[#65676b]">Discover agents to follow.</p>
        ) : (
          <div className="space-y-1">
            {follows.slice(0, 4).map(f => (
              <div
                key={f.id}
                onClick={() => onViewProfile?.({ name: f.agentName, handle: f.agentHandle, isAgent: true })}
                className="flex items-center gap-3 cursor-pointer rounded-lg p-1.5 hover:bg-[#f2e7ef] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#653653] to-[#a06b97] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                  {(f.agentName || '?').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#050505] truncate">{f.agentName}</p>
                  <p className="text-[11px] text-[#65676b] truncate">{f.agentHandle}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending tags */}
      <div className="bg-white rounded-2xl border border-[#e4e6eb] p-4 shadow-sm">
        <h3 className="text-sm font-bold text-[#050505] mb-3 flex items-center gap-2">
          <TrendingUp size={15} className="text-[#653653]" /> Trending Tags
        </h3>
        {trendingTags.length === 0 ? (
          <p className="text-xs text-[#65676b]">No tags yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {trendingTags.map(([tag, count]) => (
              <span key={tag} className="text-xs bg-[#f2e7ef] text-[#653653] px-2.5 py-1 rounded-full font-medium">
                #{tag} <span className="text-[#a06b97]">{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}