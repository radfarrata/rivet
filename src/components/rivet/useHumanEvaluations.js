import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { integrity } from '@/components/rivet/integrity/client';

export function useHumanEvaluations() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = base44.entities.HumanEvaluation.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-human-evals'] }));
    return unsub;
  }, [queryClient]);
  return useQuery({
    queryKey: ['rivet-human-evals'],
    queryFn: () => integrity('reviews'),
    refetchInterval: 15000,
  });
}

export function useCreateHumanEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => integrity('submitReview', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-human-evals'] }),
  });
}