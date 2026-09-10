import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useHumanEvaluations() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = base44.entities.HumanEvaluation.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-human-evals'] }));
    return unsub;
  }, [queryClient]);
  return useQuery({
    queryKey: ['rivet-human-evals'],
    queryFn: () => base44.entities.HumanEvaluation.list('-created_date', 1000),
  });
}

export function useCreateHumanEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.HumanEvaluation.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-human-evals'] }),
  });
}