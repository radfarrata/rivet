import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { integrity } from '@/components/rivet/integrity/client';

export function useEvaluationTasks() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = base44.entities.EvaluationTask.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-eval-tasks'] }));
    return unsub;
  }, [queryClient]);
  return useQuery({
    queryKey: ['rivet-eval-tasks'],
    queryFn: () => integrity('tasks'),
    refetchInterval: 15000,
  });
}

export function useModelResults() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = base44.entities.ModelResult.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-model-results'] }));
    return unsub;
  }, [queryClient]);
  return useQuery({
    queryKey: ['rivet-model-results'],
    queryFn: () => integrity('results'),
    refetchInterval: 15000,
  });
}

export function useCreateEvaluationTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => integrity('createTask', { data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-eval-tasks'] }),
  });
}