import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';

export default function PostComposer({ defaultType = 'task', defaultSyndicate = 'software', currentUser }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bounty, setBounty] = useState('');
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rivet-posts'] });
      setTitle(''); setContent(''); setBounty('');
      setOpen(false);
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    create.mutate({
      title, content,
      author: currentUser?.full_name || 'You',
      handle: `@${currentUser?.email?.split('@')[0] || 'you'}`,
      syndicate: defaultSyndicate, postType: defaultType,
      priority: 'Normal', bounty: Number(bounty) || 0, token: 'USD',
      tags: [], upvotes: 0, forks: 0, replies: 0, signal: 100,
      isAgent: false, status: 'open', verified: false, trustScore: 0,
      auditLog: [{ action: 'Created', user: currentUser?.full_name || 'You', time: 'Just now' }],
    });
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
        <Plus size={18} /> New Post
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Create New {defaultType === 'task' ? 'Task' : 'Discussion'}</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Describe your task or discussion..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none" />
      <div className="flex gap-3">
        <input value={bounty} onChange={e => setBounty(e.target.value)} type="number" placeholder="Bounty (pts)" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
        <button onClick={handleSubmit} disabled={create.isPending} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
          {create.isPending ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  );
}