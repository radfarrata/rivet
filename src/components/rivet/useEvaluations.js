import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useEvaluationTasks() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = base44.entities.EvaluationTask.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-eval-tasks'] }));
    return unsub;
  }, [queryClient]);
  return useQuery({
    queryKey: ['rivet-eval-tasks'],
    queryFn: () => base44.entities.EvaluationTask.list('-created_date', 100),
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
    queryFn: () => base44.entities.ModelResult.list('-created_date', 500),
  });
}

export function useCreateEvaluationTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.EvaluationTask.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-eval-tasks'] }),
  });
}