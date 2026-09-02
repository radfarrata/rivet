import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import PostCard from '../PostCard';
import PostComposer from '../PostComposer';
import PostDetailModal from '../PostDetailModal';
import { usePosts, useUpvote } from '../usePosts';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'pending_approval', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'bounty', label: 'Bounty' },
  { id: 'upvotes', label: 'Upvotes' },
];

export default function ProjectsView({ mode = 'all', currentUser, onViewProfile }) {
  const { data: posts = [], isLoading } = usePosts();
  const upvote = useUpvote();
  const [selectedPost, setSelectedPost] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  let filtered = mode === 'my-tasks'
    ? posts.filter(p => p.created_by_id === currentUser?.id)
    : mode === 'training'
    ? posts.filter(p => p.syndicate === 'bio' || p.syndicate === 'physics')
    : posts.filter(p => p.postType === 'task');

  filtered = statusFilter === 'all' ? filtered : filtered.filter(p => p.status === statusFilter);

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'bounty') return (b.bounty || 0) - (a.bounty || 0);
    if (sortBy === 'upvotes') return (b.upvotes || 0) - (a.upvotes || 0);
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const title = mode === 'my-tasks' ? 'My Tasks' : mode === 'training' ? 'Training Tasks' : 'Projects';
  const subtitle = mode === 'my-tasks' ? 'Tasks you have created' : `${filtered.length} ${statusFilter === 'all' ? '' : statusFilter.replace('_', ' ') + ' '}tasks available`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#e7e9ea]">{title}</h2>
        <p className="text-sm text-[#71767b] mt-0.5">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-[#16181c] border border-[#2f3336] p-1 rounded-lg flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f.id} onClick={() => setStatusFilter(f.id)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${statusFilter === f.id ? 'bg-[#9d4f7a] text-white' : 'text-[#71767b] hover:text-[#e7e9ea]'}`}>{f.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-[#71767b]">Sort:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-[#16181c] border border-[#2f3336] rounded-lg text-xs font-medium px-3 py-1.5 text-[#e7e9ea] focus:outline-none focus:ring-2 focus:ring-[#9d4f7a]/40 cursor-pointer">
            {SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <PostComposer defaultType="task" currentUser={currentUser} />
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-[#16181c] rounded-2xl border border-[#2f3336] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] p-12 text-center">
          <Briefcase className="w-10 h-10 text-[#4a4a4a] mx-auto mb-3" />
          <p className="text-[#71767b] text-sm">No tasks match the current filter. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} onUpvote={(p) => upvote.mutate({ id: p.id, upvotes: p.upvotes })} onClick={setSelectedPost} onViewProfile={onViewProfile} />
          ))}
        </div>
      )}
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} currentUser={currentUser} onViewProfile={onViewProfile} />}
    </div>
  );
}