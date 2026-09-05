import React, { useState, useMemo } from 'react';
import PostCard from '../PostCard';
import PostComposer from '../PostComposer';
import PostDetailModal from '../PostDetailModal';
import { usePosts, useUpvote, useToggleSave, useToggleRepost, useVotePoll } from '../usePosts';
import { Sparkles, X } from 'lucide-react';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'task', label: 'Tasks' },
  { id: 'discussion', label: 'Discussions' },
];

const SORTS = [
  { id: 'newest', label: 'Newest' },
  { id: 'upvotes', label: 'Most Upvoted' },
];

const TABS = [
  { id: 'foryou', label: 'For You' },
  { id: 'rivet', label: 'Rivet' },
  { id: 'saved', label: 'Saved' },
];

export default function FeedView({ currentUser, onViewProfile }) {
  const { data: posts = [], isLoading } = usePosts();
  const upvote = useUpvote();
  const save = useToggleSave(currentUser);
  const repost = useToggleRepost(currentUser);
  const votePoll = useVotePoll(currentUser);
  const [selectedPost, setSelectedPost] = useState(null);
  const [tab, setTab] = useState('foryou');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTag, setActiveTag] = useState(null);

  const score = (p) => (p.upvotes || 0) * 2 + (p.replies || 0) + (p.reposts || 0) + (p.bounty || 0) / 10;

  const filtered = useMemo(() => {
    let list = posts;
    if (activeTag) list = list.filter(p => (p.tags || []).includes(activeTag));
    if (tab === 'saved') list = list.filter(p => (p.savedBy || []).includes(currentUser?.id));
    list = list.filter(p => (filter === 'all' ? true : p.postType === filter));
    list = [...list].sort((a, b) => {
      if (tab === 'rivet') return score(b) - score(a);
      if (sortBy === 'upvotes') return (b.upvotes || 0) - (a.upvotes || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });
    return list;
  }, [posts, tab, filter, sortBy, activeTag, currentUser]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#050505]">Community Feed</h2>
          <p className="text-sm text-[#65676b] mt-0.5">{filtered.length} posts • Latest updates from the Rivet community</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-[#ffffff] border border-[#e4e6eb] p-1 rounded-lg">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filter === f.id ? 'bg-[#1877f2] text-white' : 'text-[#65676b] hover:text-white'}`}>{f.label}</button>
            ))}
          </div>
          {tab !== 'rivet' && (
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-[#ffffff] border border-[#e4e6eb] rounded-lg text-xs font-medium px-3 py-1.5 text-[#050505] focus:outline-none focus:ring-2 focus:ring-[#1877f2] cursor-pointer">
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-[#e4e6eb]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setActiveTag(null); }} className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${tab === t.id ? 'text-[#1877f2]' : 'text-[#65676b] hover:text-[#1877f2]'}`}>
            {t.id === 'rivet' && <Sparkles size={13} className="inline mr-1 text-[#1877f2]" />}{t.label}
            {tab === t.id && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#1877f2] rounded-full" />}
          </button>
        ))}
      </div>

      {tab === 'rivet' && <p className="text-xs text-[#65676b] -mt-2">High-signal posts ranked by upvotes, replies, reposts, and bounties.</p>}

      {activeTag && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#65676b]">Filtered by</span>
          <span className="inline-flex items-center gap-1 bg-[#1877f2]/10 text-[#1877f2] px-2.5 py-1 rounded-full text-xs font-medium">#{activeTag}</span>
          <button onClick={() => setActiveTag(null)} className="text-[#65676b] hover:text-white"><X size={14} /></button>
        </div>
      )}

      {tab !== 'saved' && <PostComposer defaultType="discussion" currentUser={currentUser} />}

      {isLoading ? (
        [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-[#ffffff] rounded-2xl border border-[#e4e6eb] animate-pulse" />)
      ) : filtered.length === 0 ? (
        <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-12 text-center">
          <p className="text-[#65676b] text-sm">{tab === 'saved' ? 'No saved posts yet. Bookmark posts to find them here.' : 'No posts yet. Be the first to share something!'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onUpvote={(p) => upvote.mutate({ id: p.id, upvotes: p.upvotes })}
              onSave={(p) => save.mutate({ post: p })}
              onRepost={(p) => repost.mutate({ post: p })}
              onVote={(oid) => votePoll.mutate({ post, optionId: oid })}
              onTagClick={(tag) => { setTab('foryou'); setActiveTag(tag); }}
              onClick={setSelectedPost}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>
      )}
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} currentUser={currentUser} onViewProfile={onViewProfile} />}
    </div>
  );
}