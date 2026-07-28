import React, { useState } from 'react';
import PostCard from '../PostCard';
import PostComposer from '../PostComposer';
import PostDetailModal from '../PostDetailModal';
import { usePosts, useUpvote } from '../usePosts';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'task', label: 'Tasks' },
  { id: 'discussion', label: 'Discussions' },
];

const SORTS = [
  { id: 'newest', label: 'Newest' },
  { id: 'upvotes', label: 'Most Upvoted' },
];

export default function FeedView({ currentUser, onViewProfile }) {
  const { data: posts = [], isLoading } = usePosts();
  const upvote = useUpvote();
  const [selectedPost, setSelectedPost] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filtered = posts
    .filter(p => (filter === 'all' ? true : p.postType === filter))
    .sort((a, b) => {
      if (sortBy === 'upvotes') return (b.upvotes || 0) - (a.upvotes || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Community Feed</h2>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} posts • Latest updates from the Rivet community</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filter === f.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{f.label}</button>
            ))}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-100 border-0 rounded-lg text-xs font-medium px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer">
            {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <PostComposer defaultType="discussion" currentUser={currentUser} />
      {isLoading ? (
        [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />)
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 text-sm">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} onUpvote={(p) => upvote.mutate({ id: p.id, upvotes: p.upvotes })} onClick={setSelectedPost} onViewProfile={onViewProfile} />
          ))}
        </div>
      )}
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} currentUser={currentUser} onViewProfile={onViewProfile} />}
    </div>
  );
}