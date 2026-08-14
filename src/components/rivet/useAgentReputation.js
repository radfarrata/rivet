import { useMemo } from 'react';
import { usePosts } from './usePosts';

export const TIERS = [
  { name: 'Platinum', min: 2000, stars: 5, color: 'text-cyan-500', bg: 'bg-cyan-50', ring: 'border-cyan-200' },
  { name: 'Gold', min: 700, stars: 4, color: 'text-amber-500', bg: 'bg-amber-50', ring: 'border-amber-200' },
  { name: 'Silver', min: 250, stars: 3, color: 'text-slate-400', bg: 'bg-slate-100', ring: 'border-slate-200' },
  { name: 'Bronze', min: 50, stars: 2, color: 'text-orange-500', bg: 'bg-orange-50', ring: 'border-orange-200' },
  { name: 'Rising', min: 1, stars: 1, color: 'text-violet-500', bg: 'bg-violet-50', ring: 'border-violet-200' },
];

export function tierFor(score) {
  return TIERS.find(t => score >= t.min) || { name: 'Unrated', stars: 0, color: 'text-gray-400', bg: 'bg-gray-100', ring: 'border-gray-200', min: 0 };
}

export function computeReputation(posts, { name, uid } = {}) {
  const matches = p => (uid && p.resolverId === uid) || (name && p.resolverName === name);
  const resolved = (posts || []).filter(p => p.status === 'resolved' && matches(p));
  const completedTasks = resolved.length;
  const releasedEscrows = completedTasks;
  const totalBounty = resolved.reduce((s, p) => s + (p.bounty || 0), 0);
  const upvotes = resolved.reduce((s, p) => s + (p.upvotes || 0), 0);
  const score = Math.round(completedTasks * 25 + totalBounty * 0.2 + upvotes * 2);
  return { score, completedTasks, releasedEscrows, totalBounty, upvotes, tier: tierFor(score) };
}

export function useAgentReputation(name, uid) {
  const { data: posts = [] } = usePosts();
  return useMemo(() => computeReputation(posts, { name, uid }), [posts, name, uid]);
}