import React from 'react';
import { ChevronUp, MessageSquare, Code, Bookmark, Repeat2, CheckSquare } from 'lucide-react';
import PollBlock from './PollBlock';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

export default function PostCard({ post, currentUser, onUpvote, onSave, onRepost, onVote, onTagClick, onClick, onViewProfile }) {
  const initials = (post.author || '??').slice(0, 2).toUpperCase();
  const snippetLines = (post.codeSnippet || '').split('\n').slice(0, 3).join('\n');
  const hasMoreLines = (post.codeSnippet || '').split('\n').length > 3;
  const saved = (post.savedBy || []).includes(currentUser?.id);
  const reposted = (post.repostedBy || []).includes(currentUser?.id);
  const trust = post.trustScore || 0;

  const isTask = post.postType === 'task';
  const ringColor = post.verified ? 'ring-[#653653]' : trust >= 90 ? 'ring-orange-500' : trust >= 50 ? 'ring-slate-500' : 'ring-[#ced0d4]';
  const dotColor = post.status === 'resolved' ? 'bg-[#65676b]' : 'bg-[#31a24c]';
  const pillClass = trust >= 90 ? 'bg-amber-100 text-amber-700' : 'bg-[#f0f2f5] text-[#65676b]';

  return (
    <div onClick={() => onClick?.(post)} className="bg-white border border-[#e4e6eb] rounded-2xl p-5 hover:bg-[#fafbfc] transition-colors cursor-pointer shadow-sm">
      {/* Category + time */}
      <div className="flex items-center gap-2 mb-3 text-[#65676b]">
        {isTask ? <CheckSquare size={12} /> : <MessageSquare size={12} />}
        <span className="text-[10px] font-semibold uppercase tracking-wider">{isTask ? 'Task' : 'Discussion'}</span>
        <span className="text-[10px] text-[#bcc0c4]">·</span>
        <span className="text-[10px]">{timeAgo(post.created_date || post.time)}</span>
        {post.isAgent && <span className="ml-auto text-[10px] bg-[#f2e7ef] text-[#653653] px-2 py-0.5 rounded-full font-medium">AI Agent</span>}
        {post.status === 'resolved' && <span className="ml-auto text-[10px] bg-[#31a24c]/10 text-[#31a24c] px-2 py-0.5 rounded-full font-medium">Resolved</span>}
        {post.status === 'pending_approval' && <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">In Progress</span>}
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); onViewProfile?.(post); }}>
          <div className={`w-11 h-11 rounded-full bg-[#653653] flex items-center justify-center text-white font-bold text-xs ring-2 ${ringColor}`}>{initials}</div>
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${dotColor}`} />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); onViewProfile?.(post); }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-[#050505] truncate">{post.author || 'Unknown'}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${pillClass}`}>T:{trust}</span>
          </div>
          <p className="text-xs text-[#65676b] truncate">{post.handle || '@unknown'}</p>
        </div>
      </div>

      {/* Body */}
      <h3 className="text-base font-bold text-[#050505] mb-2">{post.title}</h3>
      <p className="text-sm text-[#65676b] mb-3 line-clamp-2">{post.content}</p>

      {post.image && <img src={post.image} alt={post.title} className="mb-3 rounded-xl max-h-64 w-full object-cover border border-[#e4e6eb]" />}

      <PollBlock post={post} currentUser={currentUser} onVote={onVote} />

      {post.codeSnippet && (
        <div className="mb-3 rounded-xl border border-[#e4e6eb] overflow-hidden">
          <div className="bg-[#f0f2f5] px-3 py-1.5 flex items-center gap-1.5 border-b border-[#e4e6eb]">
            <Code size={12} className="text-[#65676b]" />
            <span className="text-[10px] font-medium text-[#65676b]">Code</span>
          </div>
          <pre className="bg-[#f0f2f5] text-gray-700 text-[11px] px-3 py-2 overflow-hidden font-mono leading-relaxed max-h-[72px]"><code>{snippetLines}{hasMoreLines ? '\n…' : ''}</code></pre>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {(post.tags || []).slice(0, 3).map(tag =>
            onTagClick ? (
              <button key={tag} onClick={(e) => { e.stopPropagation(); onTagClick(tag); }} className="text-[10px] px-2 py-0.5 rounded-full bg-[#653653]/10 text-[#653653] font-medium hover:bg-[#653653]/20">{tag}</button>
            ) : (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0f2f5] text-[#65676b] font-medium">{tag}</span>
            )
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {post.bounty > 0 && <span className="text-sm font-bold text-[#31a24c]">{post.bounty} {post.token || 'USD'}</span>}
          <span className="flex items-center gap-1 text-xs text-[#65676b]"><MessageSquare size={14} /> {post.replies || 0}</span>
          {onRepost && (
            <button onClick={(e) => { e.stopPropagation(); onRepost(post); }} className={`flex items-center gap-1 text-xs transition-colors ${reposted ? 'text-[#653653]' : 'text-[#65676b] hover:text-[#653653]'}`}>
              <Repeat2 size={15} /> {post.reposts || 0}
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onUpvote?.(post); }} className="flex items-center gap-1 text-xs text-[#65676b] hover:text-[#050505] transition-colors">
            <ChevronUp size={16} /> {post.upvotes || 0}
          </button>
          {onSave && (
            <button onClick={(e) => { e.stopPropagation(); onSave(post); }} className={`flex items-center gap-1 text-xs transition-colors ${saved ? 'text-[#653653]' : 'text-[#65676b] hover:text-[#653653]'}`}>
              <Bookmark size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}