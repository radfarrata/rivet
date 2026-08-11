import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCreateTransaction } from './useTransactions';
import { useCreateNotification } from './useNotifications';
import { X, ChevronUp, MessageSquare, Code, CheckCircle2, Lock, Send } from 'lucide-react';

export default function PostDetailModal({ post, onClose, currentUser, onViewProfile }) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const createTxn = useCreateTransaction();
  const createNotif = useCreateNotification();

  const notifyOwner = (type, title, message) => {
    const ownerId = post.created_by_id;
    if (!ownerId || ownerId === currentUser?.id) return;
    createNotif.mutate({ userId: ownerId, type, title, message, read: false });
  };

  const { data: comments = [] } = useQuery({
    queryKey: ['rivet-comments', post.id],
    queryFn: () => base44.entities.Comment.filter({ postId: post.id }, 'created_date', 100),
  });

  useEffect(() => {
    const unsub = base44.entities.Comment.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['rivet-comments', post.id] });
    });
    return unsub;
  }, [queryClient, post.id]);

  const upvote = useMutation({
    mutationFn: () => base44.entities.Post.update(post.id, { upvotes: (post.upvotes || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }),
  });

  const addComment = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rivet-comments', post.id] });
      base44.entities.Post.update(post.id, { replies: (post.replies || 0) + 1 });
      queryClient.invalidateQueries({ queryKey: ['rivet-posts'] });
      setCommentText('');
      notifyOwner('comment', 'New comment', `${currentUser?.full_name || 'Someone'} commented on "${post.title}"`);
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Post.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }),
  });

  const handleClaim = () => {
    const log = [...(post.auditLog || []), { action: 'Claimed', user: currentUser?.full_name || 'You', time: 'Just now' }];
    updateStatus.mutate({ id: post.id, data: { status: 'pending_approval', forks: (post.forks || 0) + 1, auditLog: log } });
    notifyOwner('claim', 'Task claimed', `${currentUser?.full_name || 'Someone'} claimed "${post.title}"`);
  };

  const handleComplete = () => {
    const log = [...(post.auditLog || []), { action: 'Completed', user: currentUser?.full_name || 'You', time: 'Just now' }];
    updateStatus.mutate({ id: post.id, data: { status: 'resolved', auditLog: log } });
    if (post.bounty > 0) {
      createTxn.mutate({ type: 'earned', description: `Bounty: ${post.title}`, amount: post.bounty, status: 'completed' });
    }
    notifyOwner('task', 'Task completed', `${currentUser?.full_name || 'Someone'} completed "${post.title}"`);
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate({
      postId: post.id,
      content: commentText,
      authorName: currentUser?.full_name || 'You',
      handle: `@${currentUser?.email?.split('@')[0] || 'you'}`,
    });
  };

  const statusBadge = post.status === 'open' ? 'bg-blue-100 text-blue-600' : post.status === 'pending_approval' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600';
  const statusLabel = post.status === 'pending_approval' ? 'In Progress' : post.status === 'resolved' ? 'Resolved' : 'Open';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { onViewProfile?.(post); onClose(); }}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{(post.author || '??').slice(0, 2).toUpperCase()}</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{post.author || 'Unknown'}</p>
              <p className="text-xs text-gray-400">{post.handle || '@unknown'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {post.isAgent && <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium">AI Agent</span>}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge}`}>{statusLabel}</span>
            {post.bounty > 0 && <span className="text-sm font-bold text-green-600 ml-auto">{post.bounty} {post.token || 'USD'}</span>}
          </div>

          <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {post.tags?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {post.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{tag}</span>)}
            </div>
          )}

          {/* Code Snippet */}
          {post.codeSnippet && (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
                <Code size={14} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500">Code</span>
              </div>
              <pre className="bg-[#1e1e2e] text-gray-300 text-xs p-4 overflow-x-auto font-mono"><code>{post.codeSnippet}</code></pre>
            </div>
          )}

          {/* Proposed Fix */}
          {post.proposedFix && (
            <div className="rounded-xl border border-green-200 overflow-hidden">
              <div className="bg-green-50 px-4 py-2 flex items-center gap-2 border-b border-green-200">
                <CheckCircle2 size={14} className="text-green-500" />
                <span className="text-xs font-medium text-green-600">Proposed Solution</span>
              </div>
              <pre className="bg-[#1a2e1a] text-green-300 text-xs p-4 overflow-x-auto font-mono"><code>{post.proposedFix}</code></pre>
            </div>
          )}

          {/* Audit Log */}
          {post.auditLog?.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Activity Log</p>
              <div className="space-y-1.5">
                {post.auditLog.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 w-20 flex-shrink-0">{entry.time || '—'}</span>
                    <span className="font-medium text-gray-700">{entry.action}</span>
                    {entry.user && <span className="text-gray-400">by {entry.user}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button onClick={() => upvote.mutate()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              <ChevronUp size={16} /> {post.upvotes || 0}
            </button>
            {post.status === 'open' && (
              <button onClick={handleClaim} disabled={updateStatus.isPending} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50">
                <Lock size={16} /> Claim Task
              </button>
            )}
            {post.status === 'pending_approval' && (
              <button onClick={handleComplete} disabled={updateStatus.isPending} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50">
                <CheckCircle2 size={16} /> Mark Complete
              </button>
            )}
            {post.status === 'resolved' && (
              <span className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-600"><CheckCircle2 size={16} /> Task Resolved</span>
            )}
          </div>

          {/* Comments */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><MessageSquare size={16} className="text-gray-400" /> Comments ({comments.length})</h3>
            <div className="space-y-3 mb-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-[10px] flex-shrink-0">{(c.authorName || '??').slice(0, 2).toUpperCase()}</div>
                  <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-gray-900">{c.authorName}</span>
                      {c.handle && <span className="text-[10px] text-gray-400">{c.handle}</span>}
                    </div>
                    <p className="text-sm text-gray-700">{c.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>}
            </div>
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                placeholder="Write a comment..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
              />
              <button onClick={handleComment} disabled={addComment.isPending || !commentText.trim()} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white p-2.5 rounded-lg transition-colors">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}