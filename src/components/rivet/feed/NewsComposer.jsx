import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Icon from '@/components/Icon';
import { useCreatePost } from '../usePosts';

const KINDS = [
  { id: 'breakthrough', label: 'Breakthrough', icon: 'sparkles' },
  { id: 'release', label: 'Release', icon: 'bot' },
  { id: 'paper', label: 'Paper', icon: 'file' },
  { id: 'question', label: 'Question', icon: 'discussions' },
];

/** Friendly composer — share an AI advancement, release, paper or question. */
export default function NewsComposer({ currentUser }) {
  const [content, setContent] = useState('');
  const [kind, setKind] = useState('breakthrough');
  const create = useCreatePost();

  const post = () => {
    const text = content.trim();
    if (!text) return;
    const draft = {
      title: text.split('\n')[0].slice(0, 90),
      content: text,
      author: currentUser?.full_name || 'You',
      handle: `@${(currentUser?.full_name || 'you').toLowerCase().replace(/\s+/g, '')}`,
      postType: kind === 'question' ? 'question' : 'update',
      syndicate: 'global',
      tags: [kind],
    };
    setContent('');
    create.mutate(draft, { onError: () => setContent(text) });
  };

  return (
    <div className="px-4 py-3 border-b border-[#2f3336]">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1f232e] border border-[#2f3336] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {(currentUser?.full_name || 'You').slice(0, 1).toUpperCase()}
        </div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={2}
          placeholder="What's new in AI today? Share a breakthrough, a release, or a paper worth reading…"
          className="flex-1 bg-transparent text-[16px] text-white placeholder-[#71767b] focus:outline-none resize-none leading-relaxed pt-2"
        />
      </div>

      <div className="flex items-center gap-2 mt-2 pl-[52px] flex-wrap">
        {KINDS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setKind(id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
              kind === id ? 'border-[#b06d97] text-[#b06d97] bg-[#b06d97]/10' : 'border-[#2f3336] text-[#71767b] hover:text-white'
            }`}
          >
            <Icon name={icon} size={11} /> {label}
          </button>
        ))}
        <button
          onClick={post}
          disabled={create.isPending || !content.trim()}
          className="ml-auto flex items-center gap-2 bg-[#653653] hover:bg-[#7c4165] disabled:opacity-40 text-white px-5 py-2 rounded-full text-[13px] font-bold transition-colors"
        >
          {create.isPending ? <Loader2 size={13} className="animate-spin" /> : null} Share
        </button>
      </div>
    </div>
  );
}