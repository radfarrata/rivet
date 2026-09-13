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
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['rivet-human-evals'] });
      const previous = queryClient.getQueryData(['rivet-human-evals']);
      queryClient.setQueryData(['rivet-human-evals'], old => [...(old || []), { ...data, id: `pending-${Date.now()}`, created_date: new Date().toISOString(), _pending: true }]);
      return { previous };
    },
    onError: (_error, _data, context) => queryClient.setQueryData(['rivet-human-evals'], context.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['rivet-human-evals'] }),
  });
}