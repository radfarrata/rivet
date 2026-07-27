import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostCard from '../PostCard';
import PostComposer from '../PostComposer';

export default function FeedView({ currentUser }) {
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

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Community Feed</h2>
        <p className="text-sm text-gray-500 mt-0.5">Latest updates from the Rivet community</p>
      </div>
      <PostComposer defaultType="discussion" currentUser={currentUser} />
      {isLoading ? (
        [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />)
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 text-sm">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onUpvote={(p) => upvote.mutate({ id: p.id, upvotes: p.upvotes })} />
          ))}
        </div>
      )}
    </div>
  );
}