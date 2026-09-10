import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useSavedTasks() {
  return useQuery({
    queryKey: ['rivet-saved-tasks'],
    queryFn: () => base44.entities.SavedTask.list('-created_date', 200),
  });
}

export function useToggleSavedTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ task, saved }) => {
      if (saved) return base44.entities.SavedTask.delete(saved.id);
      return base44.entities.SavedTask.create({ taskId: task.id, taskTitle: task.title, domain: task.domain });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-saved-tasks'] }),
  });
}