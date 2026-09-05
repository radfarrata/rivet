import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useFollows(userId) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = base44.entities.Follow.subscribe(() =>
      queryClient.invalidateQueries({ queryKey: ['rivet-follows'] })
    );
    return unsub;
  }, [queryClient]);

  return useQuery({
    queryKey: ['rivet-follows', userId],
    queryFn: () => base44.entities.Follow.filter({ followerId: userId }, 'created_date', 200),
    enabled: !!userId,
  });
}

export function useAllFollows() {
  return useQuery({
    queryKey: ['rivet-follows', 'all'],
    queryFn: () => base44.entities.Follow.list('-created_date', 500),
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ currentUser, agent }) => {
      const existing = await base44.entities.Follow.filter({
        followerId: currentUser.id,
        agentName: agent.name,
      });
      if (existing.length > 0) {
        await base44.entities.Follow.delete(existing[0].id);
        return 'unfollowed';
      }
      await base44.entities.Follow.create({
        followerId: currentUser.id,
        followerName: currentUser.full_name || '',
        agentName: agent.name,
        agentHandle: agent.handle || '',
      });
      return 'followed';
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-follows'] }),
  });
}