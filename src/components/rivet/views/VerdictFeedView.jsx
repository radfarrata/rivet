import React, { useMemo, useState } from 'react';
import { useEvaluationTasks, useModelResults } from '../useEvaluations';
import { useHumanEvaluations } from '../useHumanEvaluations';
import { usePosts, useUpvote, useToggleSave, useToggleRepost } from '../usePosts';
import { visibleTo } from '../evalStats';
import { buildVerdicts, markUpsets, buildMovements } from '../feed/verdictFeed';
import VerdictRow from '../feed/VerdictRow';
import MovementCard from '../feed/MovementCard';
import NewsComposer from '../feed/NewsComposer';
import NewsPostRow from '../feed/NewsPostRow';
import FeedTabs from '../home/FeedTabs';
import RivetEmptyState from '../RivetEmptyState';
import EvaluationTaskDetail from '../EvaluationTaskDetail';
import PostDetailModal from '../PostDetailModal';

const TABS = [
  { id: 'foryou', label: 'For you' },
  { id: 'news', label: 'News' },
  { id: 'verdicts', label: 'Verdicts' },
  { id: 'movements', label: 'Movements' },
];

export default function VerdictFeedView({ currentUser, onNavigate, onViewProfile }) {
  const { data: tasks = [], isLoading } = useEvaluationTasks();
  const { data: results = [] } = useModelResults();
  const { data: humanEvals = [] } = useHumanEvaluations();
  const { data: posts = [] } = usePosts();
  const upvote = useUpvote();
  const save = useToggleSave(currentUser);
  const repost = useToggleRepost(currentUser);

  const [tab, setTab] = useState('foryou');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const { verdicts, movements } = useMemo(() => {
    const v = markUpsets(buildVerdicts(visibleTo(tasks, currentUser), results, humanEvals));
    return { verdicts: v, movements: buildMovements(v) };
  }, [tasks, results, humanEvals, currentUser]);

  const items = useMemo(() => {
    const postItems = posts.map(p => ({ kind: 'post', key: `p-${p.id}`, date: p.created_date, data: p }));
    const verdictItems = verdicts.map(v => ({ kind: 'verdict', key: `v-${v.task.id}`, date: v.date, data: v }));
    const byDate = (a, b) => new Date(b.date || 0) - new Date(a.date || 0);

    if (tab === 'news') return postItems.sort(byDate);
    if (tab === 'verdicts') return verdictItems.sort(byDate);
    if (tab === 'movements') return movements.map((m, i) => ({ kind: 'movement', key: `m-${i}`, data: m }));
    return [...postItems, ...verdictItems].sort(byDate);
  }, [tab, posts, verdicts, movements]);

  const emptyCopy = {
    news: ['Nothing shared yet', 'Be the first to post an AI breakthrough, release or paper.'],
    verdicts: ['No verdicts yet', 'Run an evaluation and the result — with its reasoning — lands here.'],
    movements: ['No score movements yet', 'Once models are evaluated repeatedly, their shifts show up here.'],
    foryou: ['Your feed is quiet', 'Share something about AI, or run an evaluation to start the conversation.'],
  }[tab];

  return (
    <div className="max-w-[640px] mx-auto border-x border-[#2f3336] min-h-screen">
      <div className="px-4 pt-4 pb-3 border-b border-[#2f3336]">
        <h1 className="text-xl font-bold text-white">Feed</h1>
        <p className="text-[13px] text-[#71767b] mt-0.5">What's moving in AI — shared by the community, backed by evidence.</p>
      </div>

      <FeedTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab !== 'movements' && tab !== 'verdicts' && <NewsComposer currentUser={currentUser} />}

      {isLoading ? (
        <RivetEmptyState loading title="Loading the feed…" />
      ) : items.length === 0 ? (
        <RivetEmptyState title={emptyCopy[0]} description={emptyCopy[1]} />
      ) : items.map(item => {
        if (item.kind === 'post') return (
          <NewsPostRow
            key={item.key}
            post={item.data}
            currentUser={currentUser}
            onUpvote={p => upvote.mutate({ id: p.id, upvotes: p.upvotes })}
            onSave={p => save.mutate({ post: p })}
            onRepost={p => repost.mutate({ post: p })}
            onOpen={setSelectedPost}
            onViewProfile={onViewProfile}
          />
        );
        if (item.kind === 'verdict') return (
          <VerdictRow key={item.key} verdict={item.data} onOpen={setSelectedTask} onDisagree={setSelectedTask} />
        );
        return <MovementCard key={item.key} movement={item.data} onOpen={() => onNavigate?.('capability-map')} />;
      })}

      {selectedTask && <EvaluationTaskDetail task={selectedTask} currentUser={currentUser} onClose={() => setSelectedTask(null)} />}
      {selectedPost && <PostDetailModal post={selectedPost} currentUser={currentUser} onClose={() => setSelectedPost(null)} onViewProfile={onViewProfile} />}
    </div>
  );
}