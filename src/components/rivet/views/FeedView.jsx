import React, { useState } from 'react';
import PostCard from '../PostCard';
import PostComposer from '../PostComposer';
import PostDetailModal from '../PostDetailModal';
import { usePosts, useUpvote } from '../usePosts';

export default function FeedView({ currentUser }) {
  const { data: posts = [], isLoading } = usePosts();
  const upvote = useUpvote();
  const [selectedPost, setSelectedPost] = useState(null);

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
            <PostCard key={post.id} post={post} onUpvote={(p) => upvote.mutate({ id: p.id, upvotes: p.upvotes })} onClick={setSelectedPost} />
          ))}
        </div>
      )}
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} currentUser={currentUser} />}
    </div>
  );
}