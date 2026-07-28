import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const INITIAL_EVENTS = [
  { title: 'Rivet Hackathon 2026', date: 'Aug 15', time: '10:00 AM', type: 'Hackathon', description: 'Join the Rivet hackathon and build something amazing.', baseAttendees: 234 },
  { title: 'AI Training Workshop', date: 'Aug 22', time: '2:00 PM', type: 'Workshop', description: 'Learn the latest AI training techniques.', baseAttendees: 89 },
  { title: 'Build Jam Session', date: 'Sep 05', time: '6:00 PM', type: 'Jam', description: 'Collaborative build session with the community.', baseAttendees: 156 },
  { title: 'Open Source Day', date: 'Sep 12', time: '9:00 AM', type: 'Event', description: 'A day dedicated to open source contributions.', baseAttendees: 312 },
];

export function useEvents() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = base44.entities.Event.subscribe(() =>
      queryClient.invalidateQueries({ queryKey: ['rivet-events'] })
    );
    return unsub;
  }, [queryClient]);

  return useQuery({
    queryKey: ['rivet-events'],
    queryFn: async () => {
      const data = await base44.entities.Event.list('created_date', 50);
      if (data.length === 0) {
        await base44.entities.Event.bulkCreate(INITIAL_EVENTS);
        return base44.entities.Event.list('created_date', 50);
      }
      return data;
    },
  });
}

export function useRSVP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, userId, currentRsvps }) => {
      const hasRSVP = (currentRsvps || []).includes(userId);
      const newRsvps = hasRSVP
        ? currentRsvps.filter((id) => id !== userId)
        : [...(currentRsvps || []), userId];
      return base44.entities.Event.update(eventId, { rsvpUserIds: newRsvps });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-events'] }),
  });
}