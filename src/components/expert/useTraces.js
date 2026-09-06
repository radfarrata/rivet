import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useTraces() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsub = base44.entities.AgentTrace.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['pivo-traces'] });
    });
    return unsub;
  }, [queryClient]);

  return useQuery({
    queryKey: ['pivo-traces'],
    queryFn: () => base44.entities.AgentTrace.list('-created_date', 100),
  });
}

export function findStepById(steps, id) {
  if (!id) return null;
  for (const s of steps || []) {
    if (s.id === id) return s;
    const found = findStepById(s.children, id);
    if (found) return found;
  }
  return null;
}