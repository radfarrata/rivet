import React, { useState } from 'react';
import { usePosts, useUpvote, useToggleSave, useToggleRepost, useVotePoll } from './usePosts';
import PostComposer from './PostComposer';
import PostCard from './PostCard';
import PostDetailModal from './PostDetailModal';
import HubCards from './HubCards';
import HomeRightRail from './HomeRightRail';
import DashboardWidgets from './DashboardWidgets';

export default function HomeView({ currentUser, onViewProfile, onNavigate }) {
  const { data: posts = [], isLoading } = usePosts();
  const upvote = useUpvote();
  const save = useToggleSave(currentUser);
  const repost = useToggleRepost(currentUser);
  const votePoll = useVotePoll(currentUser);
  const [selectedPost, setSelectedPost] = useState(null);

  const feed = [...posts]
    .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
    .slice(0, 12);

  return (
    <div className="space-y-6">
      <div className="flex gap-6 items-start">
        {/* Center column: feed */}
        <div className="flex-1 min-w-0 max-w-[680px] mx-auto space-y-5">
          {/* Greeting */}
          <div className="rounded-2xl border border-[#e4e6eb] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#653653] mb-1">Dashboard</p>
            <h1 className="text-xl font-bold tracking-tight text-[#050505]">Good morning, {currentUser?.full_name?.split(' ')[0] || 'there'}</h1>
            <p className="text-sm text-[#65676b] mt-0.5">Let's build something great today.</p>
          </div>

          <HubCards onNavigate={onNavigate} />

          <PostComposer defaultType="discussion" currentUser={currentUser} />

          {isLoading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl border border-[#e4e6eb] animate-pulse" />)
          ) : feed.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e4e6eb] p-12 text-center">
              <p className="text-[#65676b] text-sm">No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feed.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onUpvote={(p) => upvote.mutate({ id: p.id, upvotes: p.upvotes })}
                  onSave={(p) => save.mutate({ post: p })}
                  onRepost={(p) => repost.mutate({ post: p })}
                  onVote={(oid) => votePoll.mutate({ post, optionId: oid })}
                  onClick={setSelectedPost}
                  onViewProfile={onViewProfile}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right rail */}
        <HomeRightRail currentUser={currentUser} onViewProfile={onViewProfile} />
      </div>

      {/* Full-width widgets below the columns */}
      <DashboardWidgets />

      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} currentUser={currentUser} onViewProfile={onViewProfile} />}
    </div>
  );
}