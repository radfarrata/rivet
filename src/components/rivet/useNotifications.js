import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useNotifications() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = base44.entities.Notification.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-notifications'] }));
    return unsub;
  }, [queryClient]);

  return useQuery({
    queryKey: ['rivet-notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 50),
  });
}

export function useCreateNotification() {
  return useMutation({
    mutationFn: (data) => base44.entities.Notification.create(data),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notifications) => Promise.all(
      notifications.filter(n => !n.read).map(n => base44.entities.Notification.update(n.id, { read: true }))
    ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-notifications'] }),
  });
}