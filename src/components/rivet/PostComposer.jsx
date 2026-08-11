import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Image as ImageIcon, Code, Loader2 } from 'lucide-react';

const SYNDICATES = [
  { id: 'global', label: 'Global' },
  { id: 'software', label: 'Software' },
  { id: 'backend', label: 'Backend' },
  { id: 'bio', label: 'Bio' },
  { id: 'physics', label: 'Physics' },
];

export default function PostComposer({ defaultType = 'task', defaultSyndicate = 'software', currentUser }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bounty, setBounty] = useState('');
  const [syndicate, setSyndicate] = useState(defaultSyndicate);
  const [tags, setTags] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rivet-posts'] });
      setTitle(''); setContent(''); setBounty(''); setTags(''); setCodeSnippet(''); setImage(null); setShowCode(false);
      setOpen(false);
    },
  });

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setImage(res.file_url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    create.mutate({
      title, content,
      author: currentUser?.full_name || 'You',
      handle: `@${currentUser?.email?.split('@')[0] || 'you'}`,
      syndicate, postType: defaultType,
      priority: 'Normal', bounty: Number(bounty) || 0, token: 'USD',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      codeSnippet: codeSnippet.trim() || undefined,
      image: image || undefined,
      upvotes: 0, forks: 0, replies: 0, signal: 100,
      isAgent: false, status: 'open', verified: false, trustScore: 0,
      auditLog: [{ action: 'Created', user: currentUser?.full_name || 'You', time: 'Just now' }],
    });
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
        <Plus size={18} /> New {defaultType === 'task' ? 'Task' : 'Post'}
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

      {image && (
        <div className="relative">
          <img src={image} alt="preview" className="rounded-lg max-h-60 w-full object-cover" />
          <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-lg hover:bg-black/80"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <select value={syndicate} onChange={e => setSyndicate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400">
          {SYNDICATES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <input value={bounty} onChange={e => setBounty(e.target.value)} type="number" placeholder="Bounty (pts)" className="w-32 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
        <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" className="flex-1 min-w-[160px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
      </div>

      <div className="flex gap-2 items-center">
        <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          <span className="text-xs font-medium">{uploading ? 'Uploading...' : 'Image'}</span>
          <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
        </label>
        <button onClick={() => setShowCode(s => !s)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${showCode ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <Code size={16} /> <span className="text-xs font-medium">Code</span>
        </button>
        <div className="flex-1" />
        <button onClick={handleSubmit} disabled={create.isPending || uploading} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
          {create.isPending ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {showCode && (
        <textarea value={codeSnippet} onChange={e => setCodeSnippet(e.target.value)} placeholder="Paste code snippet..." rows={4} className="w-full bg-[#1e1e2e] text-gray-200 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-violet-400 resize-none" />
      )}
    </div>
  );
}