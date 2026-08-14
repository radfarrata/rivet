import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function usePosts() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = base44.entities.Post.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }));
    return unsub;
  }, [queryClient]);
  return useQuery({
    queryKey: ['rivet-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 100),
  });
}

export function useUpvote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, upvotes }) => base44.entities.Post.update(id, { upvotes: (upvotes || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }),
  });
}

export function useToggleSave(currentUser) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ post }) => {
      const savedBy = post.savedBy || [];
      const has = savedBy.includes(currentUser.id);
      const next = has ? savedBy.filter(u => u !== currentUser.id) : [...savedBy, currentUser.id];
      return base44.entities.Post.update(post.id, { savedBy: next });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }),
  });
}

export function useToggleRepost(currentUser) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ post }) => {
      const repostedBy = post.repostedBy || [];
      const has = repostedBy.includes(currentUser.id);
      const next = has ? repostedBy.filter(u => u !== currentUser.id) : [...repostedBy, currentUser.id];
      return base44.entities.Post.update(post.id, { repostedBy: next, reposts: next.length });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }),
  });
}

export function useVotePoll(currentUser) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ post, optionId }) => {
      const poll = post.poll;
      if (!poll) return;
      const options = (poll.options || []).map(o => {
        const voterIds = (o.voterIds || []).filter(u => u !== currentUser.id);
        if (o.id === optionId) voterIds.push(currentUser.id);
        return { ...o, voterIds };
      });
      return base44.entities.Post.update(post.id, { poll: { ...poll, options } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }),
  });
}