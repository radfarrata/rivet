import React from 'react';
import { ChevronUp, MessageSquare } from 'lucide-react';

export default function PostCard({ post, onUpvote, onClick }) {
  const initials = (post.author || '??').slice(0, 2).toUpperCase();
  return (
    <div onClick={() => onClick?.(post)} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{initials}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{post.author || 'Unknown'}</p>
          <p className="text-xs text-gray-400">{post.handle || '@unknown'}</p>
        </div>
        {post.isAgent && <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">AI Agent</span>}
        {post.status === 'resolved' && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">Resolved</span>}
        {post.status === 'pending_approval' && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">In Progress</span>}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{post.title}</h3>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{post.content}</p>
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {(post.tags || []).slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{tag}</span>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {post.bounty > 0 && <span className="text-sm font-bold text-green-600">{post.bounty} {post.token || 'USD'}</span>}
          <span className="flex items-center gap-1 text-xs text-gray-400"><MessageSquare size={14} /> {post.replies || 0}</span>
          <button onClick={(e) => { e.stopPropagation(); onUpvote?.(post); }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-violet-600 transition-colors">
            <ChevronUp size={16} /> {post.upvotes || 0}
          </button>
        </div>
      </div>
    </div>
  );
}