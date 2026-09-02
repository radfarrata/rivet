import { useMemo } from 'react';
import { usePosts } from './usePosts';

export const TIERS = [
  { name: 'Platinum', min: 2000, stars: 5, color: 'text-cyan-300', bg: 'bg-cyan-500/15', ring: 'border-cyan-500/30' },
  { name: 'Gold', min: 700, stars: 4, color: 'text-amber-300', bg: 'bg-amber-500/15', ring: 'border-amber-500/30' },
  { name: 'Silver', min: 250, stars: 3, color: 'text-slate-300', bg: 'bg-slate-500/15', ring: 'border-slate-500/30' },
  { name: 'Bronze', min: 50, stars: 2, color: 'text-orange-300', bg: 'bg-orange-500/15', ring: 'border-orange-500/30' },
  { name: 'Rising', min: 1, stars: 1, color: 'text-[#e7a9c8]', bg: 'bg-[#9d4f7a]/15', ring: 'border-[#9d4f7a]/30' },
];

export function tierFor(score) {
  return TIERS.find(t => score >= t.min) || { name: 'Unrated', stars: 0, color: 'text-[#71767b]', bg: 'bg-white/5', ring: 'border-[#2f3336]', min: 0 };
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