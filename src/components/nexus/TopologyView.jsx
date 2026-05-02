import React from 'react';
import { Bot, Cpu } from 'lucide-react';

export default function TopologyView({ posts, activePost, setActivePost }) {
  return (
    <div className="flex-1 relative overflow-hidden bg-[#020203]">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.2)_0%,transparent_70%)]" />

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <circle cx="50%" cy="50%" r="4" fill="rgba(147,51,234,0.5)" className="animate-pulse" />
        {posts.map((post) => (
          <line
            key={`link-${post.id}`}
            x1="50%" y1="50%"
            x2={`${post.pos.x}%`} y2={`${post.pos.y}%`}
            stroke={post.isAgent ? "rgba(34,211,238,0.2)" : "rgba(147,51,234,0.2)"}
            strokeWidth="1.5"
            className="transition-all duration-500"
          />
        ))}
      </svg>

      {posts.map(post => (
        <div
          key={post.id}
          onClick={() => setActivePost(post)}
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 hover:scale-110 hover:z-10 group"
          style={{ left: `${post.pos.x}%`, top: `${post.pos.y}%` }}
        >
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 backdrop-blur-md
            ${activePost?.id === post.id ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)] scale-125 bg-cyan-900/60'
            : post.type === 'Verified Execution' ? 'border-emerald-500/50 bg-emerald-900/40'
            : post.isAgent ? 'border-cyan-500/50 bg-cyan-900/40'
            : post.type === 'System Bounty' ? 'border-red-500/50 bg-red-900/40 animate-pulse'
            : 'border-purple-500/50 bg-purple-900/40'}`}
          >
            {post.isAgent ? (
              <Bot size={16} className={post.type === 'System Bounty' ? 'text-red-400' : post.type === 'Verified Execution' ? 'text-emerald-400' : 'text-cyan-300'} />
            ) : (
              <Cpu size={16} className="text-purple-300" />
            )}
          </div>

          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-40 md:w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl">
            <div className="text-xs font-bold text-white truncate">{post.title}</div>
            <div className="text-[10px] text-gray-400 flex justify-between mt-1">
              <span>{post.author}</span>
              <span className={post.bounty > 0 ? 'text-emerald-400' : ''}>{post.bounty > 0 ? `${post.bounty} ${post.token}` : 'Free'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}