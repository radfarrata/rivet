import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Send, Reply } from 'lucide-react';

export default function ThreadedComments({ post, currentUser, notifyOwner }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const { data: comments = [] } = useQuery({
    queryKey: ['rivet-comments', post.id],
    queryFn: () => base44.entities.Comment.filter({ postId: post.id }, 'created_date', 200),
  });

  useEffect(() => {
    const unsub = base44.entities.Comment.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-comments', post.id] }));
    return unsub;
  }, [queryClient, post.id]);

  const add = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['rivet-comments', post.id] });
      if (!vars.parentId) {
        base44.entities.Post.update(post.id, { replies: (post.replies || 0) + 1 });
        queryClient.invalidateQueries({ queryKey: ['rivet-posts'] });
      }
      setText('');
      setReplyTo(null);
      if (notifyOwner) notifyOwner('comment', 'New comment', `${currentUser?.full_name || 'Someone'} commented on "${post.title}"`);
    },
  });

  const submit = () => {
    if (!text.trim()) return;
    add.mutate({
      postId: post.id,
      content: text,
      authorName: currentUser?.full_name || 'You',
      handle: `@${currentUser?.email?.split('@')[0] || 'you'}`,
      parentId: replyTo?.id || undefined,
    });
  };

  const byParent = {};
  comments.forEach(c => {
    const key = c.parentId || 'root';
    (byParent[key] = byParent[key] || []).push(c);
  });

  const renderNode = (c, depth) => {
    const children = byParent[c.id] || [];
    return (
      <div key={c.id} className={depth > 0 ? 'ml-6 pl-3 border-l border-[#e4e6eb]' : ''}>
        <div className="flex gap-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[#e4e6eb] flex items-center justify-center text-[#050505] font-bold text-[10px] flex-shrink-0">{(c.authorName || '??').slice(0, 2).toUpperCase()}</div>
          <div className="flex-1">
            <div className="bg-[#f0f2f5] rounded-xl px-3 py-2">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-[#050505]">{c.authorName}</span>
                {c.handle && <span className="text-[10px] text-[#65676b]">{c.handle}</span>}
              </div>
              <p className="text-sm text-[#1c1e21]">{c.content}</p>
            </div>
            <button onClick={() => { setReplyTo({ id: c.id, name: c.authorName }); setText(''); }} className="mt-1 ml-1 text-[11px] font-medium text-[#65676b] hover:text-[#1877f2] inline-flex items-center gap-1">
              <Reply size={11} /> Reply
            </button>
            {replyTo?.id === c.id && (
              <div className="mt-1 flex gap-2">
                <input
                  autoFocus
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
                  placeholder={`Reply to ${replyTo.name}...`}
                  className="flex-1 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg px-3 py-1.5 text-xs text-[#050505] placeholder-[#65676b] focus:outline-none focus:border-[#1877f2]"
                />
                <button onClick={submit} className="bg-[#1877f2] text-white px-2.5 rounded-lg"><Send size={12} /></button>
                <button onClick={() => { setReplyTo(null); setText(''); }} className="text-[#65676b] text-xs px-1">Cancel</button>
              </div>
            )}
          </div>
        </div>
        {children.map(ch => renderNode(ch, depth + 1))}
      </div>
    );
  };

  const roots = byParent.root || [];

  return (
    <div>
      <h3 className="text-sm font-bold text-[#050505] mb-3 flex items-center gap-2"><MessageSquare size={16} className="text-[#65676b]" /> Comments ({comments.length})</h3>
      <div className="space-y-1 mb-4">
        {roots.map(c => renderNode(c, 0))}
        {comments.length === 0 && <p className="text-sm text-[#65676b] text-center py-4">No comments yet. Be the first to comment!</p>}
      </div>
      <div className="flex gap-2">
        <input
          value={replyTo ? '' : text}
          onChange={e => { if (!replyTo) setText(e.target.value); }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder={replyTo ? `Replying to ${replyTo.name}...` : 'Write a comment...'}
          className="flex-1 bg-[#f0f2f5] border border-[#e4e6eb] rounded-lg px-3 py-2 text-sm text-[#050505] placeholder-[#65676b] focus:outline-none focus:border-[#1877f2]"
        />
        <button onClick={submit} disabled={add.isPending || !text.trim() || !!replyTo} className="bg-[#1877f2] hover:bg-[#b85e92] disabled:opacity-40 text-white p-2.5 rounded-lg transition-colors">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}