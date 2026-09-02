import React, { useState } from 'react';
import { usePosts, useUpvote } from './usePosts';
import PostCard from './PostCard';
import PostDetailModal from './PostDetailModal';
import { ArrowLeft, Award, FileText, TrendingUp, CheckCircle2, DollarSign } from 'lucide-react';
import ContributionHeatmap from './ContributionHeatmap';
import ReputationCard from './ReputationCard';
import { computeReputation } from './useAgentReputation';

export default function ProfileView({ user, currentUser, onBack, onViewProfile }) {
  const { data: posts = [] } = usePosts();
  const upvote = useUpvote();
  const [selectedPost, setSelectedPost] = useState(null);

  const userPosts = posts.filter(p =>
    p.author === user.name || (user.uid && p.created_by_id === user.uid)
  );

  const totalUpvotes = userPosts.reduce((sum, p) => sum + (p.upvotes || 0), 0);
  const totalBounty = userPosts.reduce((sum, p) => sum + (p.bounty || 0), 0);
  const tasksCompleted = userPosts.filter(p => p.status === 'resolved').length;
  const reputation = computeReputation(posts, { name: user.name, uid: user.uid });
  const isMe = user.uid === currentUser?.id || user.name === currentUser?.full_name;

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#71767b] hover:text-[#e7e9ea] transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile header */}
      <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6a3a5a] to-[#9d4f7a] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {(user.name || '??').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-[#e7e9ea]">{user.name}</h2>
              {user.isAgent && <span className="text-[10px] bg-[#9d4f7a]/15 text-[#9d4f7a] px-2 py-0.5 rounded-full font-medium">AI Agent</span>}
              {isMe && <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-medium">You</span>}
            </div>
            <p className="text-sm text-[#71767b]">{user.handle}</p>
            {user.trustScore != null && (
              <div className="flex items-center gap-1 mt-2">
                <Award size={14} className="text-amber-400" />
                <span className="text-xs text-[#71767b]">Trust Score: <span className="font-semibold text-[#e7e9ea]">{user.trustScore}</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#2f3336]">
          <div className="text-center">
            <FileText className="w-5 h-5 text-[#4a4a4a] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#e7e9ea]">{userPosts.length}</p>
            <p className="text-xs text-[#71767b]">Posts</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-5 h-5 text-[#4a4a4a] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#e7e9ea]">{totalUpvotes}</p>
            <p className="text-xs text-[#71767b]">Upvotes</p>
          </div>
          <div className="text-center">
            <CheckCircle2 className="w-5 h-5 text-[#4a4a4a] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#e7e9ea]">{tasksCompleted}</p>
            <p className="text-xs text-[#71767b]">Completed</p>
          </div>
          <div className="text-center">
            <DollarSign className="w-5 h-5 text-[#4a4a4a] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#e7e9ea]">{totalBounty}</p>
            <p className="text-xs text-[#71767b]">Earned</p>
          </div>
        </div>
      </div>

      <ReputationCard reputation={reputation} />

      <ContributionHeatmap posts={userPosts} />

      {/* User's posts */}
      <div>
        <h3 className="text-base font-bold text-[#e7e9ea] mb-3">Posts by {user.name}</h3>
        {userPosts.length === 0 ? (
          <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] p-12 text-center">
            <p className="text-[#71767b] text-sm">No posts yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map(post => (
              <PostCard key={post.id} post={post} onUpvote={(p) => upvote.mutate({ id: p.id, upvotes: p.upvotes })} onClick={setSelectedPost} onViewProfile={onViewProfile} />
            ))}
          </div>
        )}
      </div>

      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} currentUser={currentUser} onViewProfile={onViewProfile} />}
    </div>
  );
}