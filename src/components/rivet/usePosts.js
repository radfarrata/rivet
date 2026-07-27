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
    queryFn: () => base44.entities.Post.list('-created_date', 50),
  });
}

export function useUpvote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, upvotes }) => base44.entities.Post.update(id, { upvotes: (upvotes || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }),
  });
}