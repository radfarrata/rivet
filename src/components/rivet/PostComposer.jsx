import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Image as ImageIcon, Code, Loader2, BarChart3 } from 'lucide-react';

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
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async (data) => {
      const post = await base44.entities.Post.create(data);
      if ((post.bounty || 0) > 0 && currentUser?.id) {
        await base44.entities.Escrow.create({
          postId: post.id, taskTitle: post.title, amount: post.bounty,
          status: 'held', requesterId: currentUser.id, requesterName: currentUser.full_name,
        });
        await base44.entities.Transaction.create({
          type: 'withdrawn', description: `Escrow hold: ${post.title}`, amount: -post.bounty, status: 'completed', method: 'escrow',
        });
      }
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rivet-posts'] });
      queryClient.invalidateQueries({ queryKey: ['rivet-escrows'] });
      queryClient.invalidateQueries({ queryKey: ['rivet-transactions'] });
      setTitle(''); setContent(''); setBounty(''); setTags(''); setCodeSnippet(''); setImage(null); setShowCode(false);
      setShowPoll(false); setPollQuestion(''); setPollOptions(['', '']);
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
    const cleanOptions = pollOptions.map(o => o.trim()).filter(Boolean);
    const poll = showPoll && pollQuestion.trim() && cleanOptions.length >= 2
      ? { question: pollQuestion.trim(), options: cleanOptions.map((text, i) => ({ id: String(i), text, voterIds: [] })) }
      : undefined;
    create.mutate({
      title, content,
      author: currentUser?.full_name || 'You',
      handle: `@${currentUser?.email?.split('@')[0] || 'you'}`,
      syndicate, postType: defaultType,
      priority: 'Normal', bounty: Number(bounty) || 0, token: 'USD',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      codeSnippet: codeSnippet.trim() || undefined,
      image: image || undefined,
      poll,
      upvotes: 0, forks: 0, replies: 0, reposts: 0, signal: 100,
      isAgent: false, status: 'open', verified: false, trustScore: 0,
      auditLog: [{ action: 'Created', user: currentUser?.full_name || 'You', time: 'Just now' }],
    });
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full bg-[#9d4f7a] hover:bg-[#b85e92] text-white rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
        <Plus size={18} /> New {defaultType === 'task' ? 'Task' : 'Post'}
      </button>
    );
  }

  return (
    <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Create New {defaultType === 'task' ? 'Task' : 'Discussion'}</h3>
        <button onClick={() => setOpen(false)} className="text-[#888] hover:text-white"><X size={18} /></button>
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full bg-[#0d0d12] border border-[#2f3336] rounded-lg px-3 py-2 text-sm text-[#e7e9ea] placeholder-[#666] focus:outline-none focus:border-[#9d4f7a]" />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Describe your task or discussion..." rows={3} className="w-full bg-[#0d0d12] border border-[#2f3336] rounded-lg px-3 py-2 text-sm text-[#e7e9ea] placeholder-[#666] focus:outline-none focus:border-[#9d4f7a] resize-none" />

      {image && (
        <div className="relative">
          <img src={image} alt="preview" className="rounded-lg max-h-60 w-full object-cover border border-[#2f3336]" />
          <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-lg hover:bg-black/80"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <select value={syndicate} onChange={e => setSyndicate(e.target.value)} className="bg-[#0d0d12] border border-[#2f3336] rounded-lg px-3 py-2 text-sm text-[#e7e9ea] focus:outline-none focus:border-[#9d4f7a]">
          {SYNDICATES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <input value={bounty} onChange={e => setBounty(e.target.value)} type="number" placeholder="Bounty (pts)" className="w-32 bg-[#0d0d12] border border-[#2f3336] rounded-lg px-3 py-2 text-sm text-[#e7e9ea] placeholder-[#666] focus:outline-none focus:border-[#9d4f7a]" />
        <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" className="flex-1 min-w-[160px] bg-[#0d0d12] border border-[#2f3336] rounded-lg px-3 py-2 text-sm text-[#e7e9ea] placeholder-[#666] focus:outline-none focus:border-[#9d4f7a]" />
      </div>

      {showPoll && (
        <div className="rounded-xl border border-[#9d4f7a]/30 bg-[#9d4f7a]/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9d4f7a] uppercase tracking-wide">Poll</span>
            <button onClick={() => { setShowPoll(false); setPollQuestion(''); setPollOptions(['', '']); }} className="text-[#888] hover:text-white"><X size={14} /></button>
          </div>
          <input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Poll question" className="w-full bg-[#0d0d12] border border-[#2f3336] rounded-lg px-3 py-2 text-sm text-[#e7e9ea] placeholder-[#666] focus:outline-none focus:border-[#9d4f7a]" />
          {pollOptions.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input value={opt} onChange={e => setPollOptions(opts => opts.map((o, j) => j === i ? e.target.value : o))} placeholder={`Option ${i + 1}`} className="flex-1 bg-[#0d0d12] border border-[#2f3336] rounded-lg px-3 py-1.5 text-sm text-[#e7e9ea] placeholder-[#666] focus:outline-none focus:border-[#9d4f7a]" />
              {pollOptions.length > 2 && <button onClick={() => setPollOptions(opts => opts.filter((_, j) => j !== i))} className="text-[#888] hover:text-red-400 px-1"><X size={14} /></button>}
            </div>
          ))}
          {pollOptions.length < 4 && <button onClick={() => setPollOptions(opts => [...opts, ''])} className="text-xs font-medium text-[#9d4f7a] hover:underline">+ Add option</button>}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2f3336] text-sm text-[#888] cursor-pointer hover:bg-white/5 transition-colors">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          <span className="text-xs font-medium">{uploading ? 'Uploading...' : 'Image'}</span>
          <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
        </label>
        <button onClick={() => setShowCode(s => !s)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${showCode ? 'border-[#9d4f7a] bg-[#9d4f7a]/10 text-[#9d4f7a]' : 'border-[#2f3336] text-[#888] hover:bg-white/5'}`}>
          <Code size={16} /> <span className="text-xs font-medium">Code</span>
        </button>
        <button onClick={() => setShowPoll(s => !s)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${showPoll ? 'border-[#9d4f7a] bg-[#9d4f7a]/10 text-[#9d4f7a]' : 'border-[#2f3336] text-[#888] hover:bg-white/5'}`}>
          <BarChart3 size={16} /> <span className="text-xs font-medium">Poll</span>
        </button>
        <div className="flex-1" />
        <button onClick={handleSubmit} disabled={create.isPending || uploading} className="bg-[#9d4f7a] hover:bg-[#b85e92] disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
          {create.isPending ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {showCode && (
        <textarea value={codeSnippet} onChange={e => setCodeSnippet(e.target.value)} placeholder="Paste code snippet..." rows={4} className="w-full bg-[#0d0d12] text-gray-200 border border-[#2f3336] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#9d4f7a] resize-none" />
      )}
    </div>
  );
}