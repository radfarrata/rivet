import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Briefcase } from 'lucide-react';
import PostCard from '../PostCard';
import PostComposer from '../PostComposer';

export default function ProjectsView({ mode = 'all', currentUser }) {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['rivet-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50),
  });

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }));
    return unsub;
  }, [queryClient]);

  const upvote = useMutation({
    mutationFn: ({ id, upvotes }) => base44.entities.Post.update(id, { upvotes: (upvotes || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }),
  });

  const filtered = mode === 'my-tasks'
    ? posts.filter(p => p.created_by_id === currentUser?.id)
    : mode === 'training'
    ? posts.filter(p => p.syndicate === 'bio' || p.syndicate === 'physics')
    : posts.filter(p => p.postType === 'task');

  const title = mode === 'my-tasks' ? 'My Tasks' : mode === 'training' ? 'Training Tasks' : 'Projects';
  const subtitle = mode === 'my-tasks' ? 'Tasks you have created' : `${filtered.length} open tasks available`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <PostComposer defaultType="task" currentUser={currentUser} />
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No tasks yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} onUpvote={(p) => upvote.mutate({ id: p.id, upvotes: p.upvotes })} />
          ))}
        </div>
      )}
    </div>
  );
}