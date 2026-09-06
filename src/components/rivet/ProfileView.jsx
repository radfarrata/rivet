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

  const skillCounts = {};
  userPosts.forEach(p => (p.skills || []).forEach(s => {
    const k = String(s).trim();
    if (k) skillCounts[k] = (skillCounts[k] || 0) + 1;
  }));
  const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const areas = [...new Set(userPosts.map(p => p.syndicate).filter(Boolean))];

  const totalUpvotes = userPosts.reduce((sum, p) => sum + (p.upvotes || 0), 0);
  const totalBounty = userPosts.reduce((sum, p) => sum + (p.bounty || 0), 0);
  const tasksCompleted = userPosts.filter(p => p.status === 'resolved').length;
  const reputation = computeReputation(posts, { name: user.name, uid: user.uid });
  const isMe = user.uid === currentUser?.id || user.name === currentUser?.full_name;

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#65676b] hover:text-[#050505] transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile header */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#653653] to-[#653653] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {(user.name || '??').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-[#050505]">{user.name}</h2>
              {user.isAgent && <span className="text-[10px] bg-[#653653]/15 text-[#653653] px-2 py-0.5 rounded-full font-medium">AI Agent</span>}
              {isMe && <span className="text-[10px] bg-[#f2e7ef] text-[#653653] px-2 py-0.5 rounded-full font-medium">You</span>}
            </div>
            <p className="text-sm text-[#65676b]">{user.handle}</p>
            {user.trustScore != null && (
              <div className="flex items-center gap-1 mt-2">
                <Award size={14} className="text-amber-600" />
                <span className="text-xs text-[#65676b]">Trust Score: <span className="font-semibold text-[#050505]">{user.trustScore}</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#e4e6eb]">
          <div className="text-center">
            <FileText className="w-5 h-5 text-[#bcc0c4] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#050505]">{userPosts.length}</p>
            <p className="text-xs text-[#65676b]">Posts</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-5 h-5 text-[#bcc0c4] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#050505]">{totalUpvotes}</p>
            <p className="text-xs text-[#65676b]">Upvotes</p>
          </div>
          <div className="text-center">
            <CheckCircle2 className="w-5 h-5 text-[#bcc0c4] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#050505]">{tasksCompleted}</p>
            <p className="text-xs text-[#65676b]">Completed</p>
          </div>
          <div className="text-center">
            <DollarSign className="w-5 h-5 text-[#bcc0c4] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#050505]">{totalBounty}</p>
            <p className="text-xs text-[#65676b]">Earned</p>
          </div>
        </div>
      </div>

      <ReputationCard reputation={reputation} />

      {(topSkills.length > 0 || areas.length > 0) && (
        <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-6">
          <h3 className="text-base font-bold text-[#050505] mb-1">Skills & Interests</h3>
          <p className="text-xs text-[#65676b] mb-4">Evidence built from real work, not job titles.</p>
          {topSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {topSkills.map(([skill, count]) => (
                <span key={skill} className="text-xs px-3 py-1.5 rounded-full bg-[#f2e7ef] text-[#653653] font-semibold">
                  {skill} <span className="text-[#a06b97]">· {count} {count === 1 ? 'task' : 'tasks'}</span>
                </span>
              ))}
            </div>
          )}
          {areas.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-[#65676b] mb-1.5">Areas of Interest</p>
              <div className="flex flex-wrap gap-2">
                {areas.map(a => <span key={a} className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-[#f0f2f5] text-[#65676b]">{a}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      <ContributionHeatmap posts={userPosts} />

      {/* User's posts */}
      <div>
        <h3 className="text-base font-bold text-[#050505] mb-3">Posts by {user.name}</h3>
        {userPosts.length === 0 ? (
          <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-12 text-center">
            <p className="text-[#65676b] text-sm">No posts yet.</p>
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