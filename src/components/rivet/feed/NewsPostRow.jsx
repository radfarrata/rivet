import React from 'react';
import Icon from '@/components/Icon';

const KIND_STYLE = {
  breakthrough: 'bg-[#2fd4a7]/15 text-[#2fd4a7]',
  release: 'bg-[#4f8cff]/15 text-[#4f8cff]',
  paper: 'bg-[#f5b544]/15 text-[#f5b544]',
  question: 'bg-[#b06d97]/15 text-[#b06d97]',
};

const fmt = (d) => {
  if (!d) return '';
  const h = (Date.now() - new Date(d)) / 36e5;
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m`;
  if (h < 24) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
};

/** A community news post — the friendly half of the feed. */
export default function NewsPostRow({ post, currentUser, onUpvote, onSave, onRepost, onOpen, onViewProfile }) {
  const kind = (post.tags || [])[0];
  const saved = (post.savedBy || []).includes(currentUser?.id);
  const reposted = (post.repostedBy || []).includes(currentUser?.id);

  return (
    <article onClick={() => onOpen?.(post)} className="px-4 py-4 border-b border-[#2f3336] hover:bg-[#16181c] transition-colors cursor-pointer flex gap-3">
      <button
        onClick={e => { e.stopPropagation(); onViewProfile?.(post); }}
        className="w-10 h-10 rounded-full bg-[#1f232e] border border-[#2f3336] flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
      >
        {(post.author || '?').slice(0, 1).toUpperCase()}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[13px] flex-wrap">
          <span className="font-bold text-white">{post.author || 'Anonymous'}</span>
          <span className="text-[#71767b]">{post.handle} · {fmt(post.created_date)}</span>
          {kind && KIND_STYLE[kind] && (
            <span className={`ml-1 px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${KIND_STYLE[kind]}`}>{kind}</span>
          )}
        </div>

        <p className="text-[15px] text-[#e7e9ea] mt-1 leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {post.image && (
          <img src={post.image} alt="" className="mt-3 rounded-2xl border border-[#2f3336] w-full object-cover max-h-80" />
        )}

        <div className="flex items-center gap-6 mt-3 text-[#71767b]" onClick={e => e.stopPropagation()}>
          <button onClick={() => onOpen?.(post)} className="flex items-center gap-1.5 text-[12px] hover:text-[#4f8cff] transition-colors">
            <Icon name="discussions" size={13} /> {post.replies || 0}
          </button>
          <button onClick={() => onRepost?.(post)} className={`flex items-center gap-1.5 text-[12px] transition-colors ${reposted ? 'text-[#2fd4a7]' : 'hover:text-[#2fd4a7]'}`}>
            <Icon name="trending" size={13} /> {post.reposts || 0}
          </button>
          <button onClick={() => onUpvote?.(post)} className="flex items-center gap-1.5 text-[12px] hover:text-[#b06d97] transition-colors">
            <Icon name="arrow-up" size={13} /> {post.upvotes || 0}
          </button>
          <button onClick={() => onSave?.(post)} className={`flex items-center gap-1.5 text-[12px] transition-colors ${saved ? 'text-[#b06d97]' : 'hover:text-[#b06d97]'}`}>
            <Icon name="bookmark" size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}