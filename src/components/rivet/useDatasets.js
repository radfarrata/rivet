import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useDatasets() {
  return useQuery({ queryKey: ['datasets'], queryFn: () => base44.entities.Dataset.list('-created_date', 100) });
}

export function useCreateDataset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.Dataset.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['datasets'] }),
  });
}

export function useDeleteDataset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => base44.entities.Dataset.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['datasets'] }),
  });
}