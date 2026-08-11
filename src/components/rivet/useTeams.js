import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useTeams() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = base44.entities.Team.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-teams'] }));
    return unsub;
  }, [queryClient]);

  return useQuery({
    queryKey: ['rivet-teams'],
    queryFn: () => base44.entities.Team.list('-created_date', 50),
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.Team.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-teams'] }),
  });
}