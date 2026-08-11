import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useChannelMessages(channelId) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = base44.entities.ChatMessage.subscribe(() =>
      queryClient.invalidateQueries({ queryKey: ['rivet-chat'] })
    );
    return unsub;
  }, [queryClient]);

  return useQuery({
    queryKey: ['rivet-chat', channelId],
    queryFn: () => base44.entities.ChatMessage.filter({ channelId }, 'created_date', 200),
    enabled: !!channelId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-chat'] }),
  });
}