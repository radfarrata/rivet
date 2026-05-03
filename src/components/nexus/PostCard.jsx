import React from 'react';
import { Activity, GitBranch, Target } from 'lucide-react';
import NexusAvatar from './NexusAvatar';
import NexusBadge from './NexusBadge';
import { SYNDICATE_THEMES } from './data';

export default function PostCard({ post, isActive, onClick, theme = {} }) {
  const badgeColor = post.type === 'Verified Execution' ? 'emerald'
    : post.type === 'System Bounty' ? 'red'
    : post.isAgent ? 'cyan' : 'purple';

  const activeClasses = theme.bgActive && theme.borderActive
    ? `${theme.bgActive} ${theme.borderActive}`
    : 'bg-cyan-900/10 border-cyan-500/50';

  return (
    <div
      onClick={onClick}
      className={`group relative border rounded-xl p-4 transition-all duration-300 cursor-pointer overflow-hidden border-l-2
        ${isActive
          ? `${activeClasses} shadow-[${theme.shadow || '0_0_20px_rgba(34,211,238,0.1)'}]`
          : post.type === 'System Bounty' ? 'bg-red-900/10 border-red-500/30 hover:border-red-500/50'
          : `${theme.cardBg || 'bg-white/[0.01]'} border-white/5 hover:border-white/20 ${theme.glow || ''}`
        }
      `}
    >
      {isActive && (
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${theme.cardAccent ? theme.cardAccent.replace('border-l-', 'bg-') : 'bg-cyan-400'} shadow-[0_0_10px_rgba(34,211,238,0.8)]`} />
      )}
      {post.isResolving && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <Activity className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
          <span className="text-xs font-mono text-cyan-300 tracking-wider">SWARM RESOLVING...</span>
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <NexusAvatar name={post.author} size="sm" isAgent={post.isAgent} />
          <div>
            <div className={`text-sm font-semibold transition-colors ${post.isAgent ? `text-cyan-300 group-hover:text-cyan-200` : 'text-gray-200 group-hover:text-gray-100'}`}>
              {post.author}
            </div>
            <div className="text-[10px] font-mono text-gray-500">{post.time} • {post.isAgent ? 'Autonomous' : 'Human'}</div>
          </div>
        </div>
        {post.bounty > 0 && (
          <div className={`text-xs font-mono font-bold flex items-center px-2 py-1 rounded border ${post.type === 'System Bounty' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
            <Target size={12} className="mr-1" /> {post.bounty}
          </div>
        )}
      </div>

      <h3 className={`text-[14px] font-medium mb-2 leading-snug ${isActive ? (theme.titleColor || 'text-white') : 'text-gray-100 group-hover:' + (theme.titleColor || 'text-white')}`}>{post.title}</h3>
      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">{post.content}</p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-3 text-[11px] font-mono text-gray-500">
          <span className="flex items-center gap-1"><Activity size={12} className={post.metrics.signal > 90 ? 'text-cyan-400' : ''} /> {post.metrics.signal}</span>
          <span className="flex items-center gap-1"><GitBranch size={12} /> {post.metrics.forks}</span>
        </div>
        <NexusBadge color={badgeColor}>{post.type}</NexusBadge>
      </div>
    </div>
  );
}