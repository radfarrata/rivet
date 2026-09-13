import React, { useMemo, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, FileText, Sparkles, Target } from 'lucide-react';
import { usePosts, useUpvote } from './usePosts';
import PostCard from './PostCard';
import PostDetailModal from './PostDetailModal';
import SnapchatProfileHeader from './SnapchatProfileHeader';
import ContributionHeatmap from './ContributionHeatmap';
import ReputationCard from './ReputationCard';
import { computeReputation } from './useAgentReputation';

export default function ProfileView({
  user,
  currentUser,
  onBack,
  onViewProfile,
}) {
  const { data: posts = [] } = usePosts();
  const upvote = useUpvote();
  const [selectedPost, setSelectedPost] = useState(null);

  const isMe =
    user?.uid === currentUser?.id ||
    user?.name === currentUser?.full_name;

  const userPosts = useMemo(() => {
    if (!user) return [];

    return posts.filter(
      (post) =>
        post.author === user.name ||
        (user.uid && post.created_by_id === user.uid)
    );
  }, [posts, user]);

  const profileStats = useMemo(() => {
    const skillCounts = {};
    const areas = new Set();

    let totalUpvotes = 0;
    let totalBounty = 0;
    let tasksCompleted = 0;

    userPosts.forEach((post) => {
      totalUpvotes += Number(post.upvotes || 0);
      totalBounty += Number(post.bounty || 0);

      if (post.status === 'resolved') {
        tasksCompleted += 1;
      }

      if (post.syndicate) {
        areas.add(post.syndicate);
      }

      (post.skills || []).forEach((skill) => {
        const normalizedSkill = String(skill).trim();

        if (normalizedSkill) {
          skillCounts[normalizedSkill] =
            (skillCounts[normalizedSkill] || 0) + 1;
        }
      });
    });

    const topSkills = Object.entries(skillCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10);

    return {
      topSkills,
      areas: Array.from(areas),
      totalUpvotes,
      totalBounty,
      tasksCompleted,
    };
  }, [userPosts]);

  const reputation = useMemo(
    () =>
      computeReputation(posts, {
        name: user?.name,
        uid: user?.uid,
      }),
    [posts, user]
  );

  if (!user) {
    return (
      <div className="rounded-2xl border border-[#e4e6eb] bg-white p-10 text-center">
        <p className="text-sm text-[#65676b]">
          This profile is unavailable.
        </p>
      </div>
    );
  }

  const hasExpertise =
    profileStats.topSkills.length > 0 || profileStats.areas.length > 0;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 pb-10">
      {/* Navigation */}
      <button
        type="button"
        onClick={onBack}
        className="group inline-flex items-center gap-2 rounded-lg py-1.5 text-sm font-medium text-[#65676b] transition-colors hover:text-[#050505]"
      >
        <ArrowLeft
          size={17}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Back to community
      </button>

      {/* Profile overview */}
      <section className="overflow-hidden rounded-3xl border border-[#e4e6eb] bg-white shadow-sm">
        <SnapchatProfileHeader
          user={user}
          isMe={isMe}
          stats={{
            posts: userPosts.length,
            upvotes: profileStats.totalUpvotes,
            completed: profileStats.tasksCompleted,
            earned: profileStats.totalBounty,
          }}
        />
      </section>

      {/* Reputation */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={17} className="text-[#653653]" />
          <h2 className="text-lg font-bold tracking-tight text-[#050505]">
            Reputation
          </h2>
        </div>

        <ReputationCard reputation={reputation} />
      </section>

      {/* Expertise */}
      {hasExpertise && (
        <section className="rounded-3xl border border-[#e4e6eb] bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f2e7ef] text-[#653653]">
              <BriefcaseBusiness size={19} />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#050505]">
                Expertise & interests
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#65676b]">
                A profile of the subjects, skills, and communities reflected
                in {isMe ? 'your' : `${user.name}'s`} contributions.
              </p>
            </div>
          </div>

          {profileStats.topSkills.length > 0 && (
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <Target size={15} className="text-[#65676b]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#65676b]">
                  Demonstrated skills
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {profileStats.topSkills.map(([skill, count]) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#ead7e5] bg-[#f9f2f7] px-3 py-1.5 text-xs font-semibold text-[#653653]"
                  >
                    {skill}
                    <span className="font-medium text-[#a06b97]">
                      {count} {count === 1 ? 'contribution' : 'contributions'}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {profileStats.areas.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <FileText size={15} className="text-[#65676b]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#65676b]">
                  Areas of interest
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {profileStats.areas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-[#f0f2f5] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#65676b]"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Activity */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-[#050505]">
            Contribution activity
          </h2>
        </div>

        <ContributionHeatmap posts={userPosts} />
      </section>

      {/* Posts */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#050505]">
              {isMe ? 'Your contributions' : `${user.name}'s contributions`}
            </h2>
            <p className="mt-1 text-sm text-[#65676b]">
              Ideas, tasks, and discussions shared with the community.
            </p>
          </div>

          <span className="whitespace-nowrap text-xs font-semibold text-[#65676b]">
            {userPosts.length}{' '}
            {userPosts.length === 1 ? 'contribution' : 'contributions'}
          </span>
        </div>

        {userPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#d9dce1] bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#f0f2f5] text-[#65676b]">
              <FileText size={19} />
            </div>

            <h3 className="text-sm font-bold text-[#050505]">
              No contributions yet
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#65676b]">
              {isMe
                ? 'Share your first idea or help solve a task to start building your profile.'
                : 'This user has not shared any contributions yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpvote={(selected) =>
                  upvote.mutate({
                    id: selected.id,
                    upvotes: selected.upvotes,
                  })
                }
                onClick={setSelectedPost}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
        )}
      </section>

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          currentUser={currentUser}
          onViewProfile={onViewProfile}
        />
      )}
    </main>
  );
}
