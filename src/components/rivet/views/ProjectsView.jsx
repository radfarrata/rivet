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
        <h2 className="text-xl font-bold text-[#050505]">{title}</h2>
        <p className="text-sm text-[#65676b] mt-0.5">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-[#ffffff] border border-[#e4e6eb] p-1 rounded-lg flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f.id} onClick={() => setStatusFilter(f.id)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${statusFilter === f.id ? 'bg-[#1877f2] text-white' : 'text-[#65676b] hover:text-[#050505]'}`}>{f.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-[#65676b]">Sort:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-[#ffffff] border border-[#e4e6eb] rounded-lg text-xs font-medium px-3 py-1.5 text-[#050505] focus:outline-none focus:ring-2 focus:ring-[#1877f2]/40 cursor-pointer">
            {SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <PostComposer defaultType="task" currentUser={currentUser} />
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-[#ffffff] rounded-2xl border border-[#e4e6eb] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-12 text-center">
          <Briefcase className="w-10 h-10 text-[#bcc0c4] mx-auto mb-3" />
          <p className="text-[#65676b] text-sm">No tasks match the current filter. Create one to get started.</p>
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