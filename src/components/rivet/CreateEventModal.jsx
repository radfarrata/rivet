import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CreateEventModal({ onClose }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('Event');
  const [description, setDescription] = useState('');

  const create = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rivet-events'] });
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !date.trim()) return;
    create.mutate({ title, date, time: time || 'All day', type, description, baseAttendees: 0 });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Create New Event</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Rivet Hackathon" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Date</label>
              <input value={date} onChange={e => setDate(e.target.value)} placeholder="Aug 15" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Time</label>
              <input value={time} onChange={e => setTime(e.target.value)} placeholder="10:00 AM" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400">
              <option>Event</option>
              <option>Hackathon</option>
              <option>Workshop</option>
              <option>Jam</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the event..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none" />
          </div>
          <button onClick={handleSubmit} disabled={create.isPending || !title.trim() || !date.trim()} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
            {create.isPending ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
}