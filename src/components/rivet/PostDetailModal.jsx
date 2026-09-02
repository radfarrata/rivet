import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCreateTransaction } from './useTransactions';
import { useCreateNotification } from './useNotifications';
import { useEscrows, useReleaseEscrow, useRefundEscrow } from './useEscrow';
import { useToggleSave, useToggleRepost, useVotePoll } from './usePosts';
import PollBlock from './PollBlock';
import ThreadedComments from './ThreadedComments';
import { X, ChevronUp, MessageSquare, Code, CheckCircle2, Lock, Send, Bookmark, Repeat2 } from 'lucide-react';

export default function PostDetailModal({ post, onClose, currentUser, onViewProfile }) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const createTxn = useCreateTransaction();
  const createNotif = useCreateNotification();
  const { data: escrows = [] } = useEscrows();
  const escrow = escrows.find(e => e.postId === post.id);
  const releaseEscrow = useReleaseEscrow();
  const refundEscrow = useRefundEscrow();
  const isRequester = post.created_by_id === currentUser?.id;
  const toggleSave = useToggleSave(currentUser);
  const toggleRepost = useToggleRepost(currentUser);
  const votePoll = useVotePoll(currentUser);
  const saved = (post.savedBy || []).includes(currentUser?.id);
  const reposted = (post.repostedBy || []).includes(currentUser?.id);

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
    updateStatus.mutate({ id: post.id, data: { status: 'pending_approval', forks: (post.forks || 0) + 1, resolverId: currentUser?.id, resolverName: currentUser?.full_name || 'You', auditLog: log } });
    notifyOwner('claim', 'Task claimed', `${currentUser?.full_name || 'Someone'} claimed "${post.title}"`);
  };

  const handleVerify = () => {
    if (!escrow) return;
    releaseEscrow.mutate({ escrow, post, currentUser });
  };

  const handleRefund = () => {
    if (!escrow) return;
    refundEscrow.mutate({ escrow, post, currentUser });
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6a3a5a] to-[#9d4f7a] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{(post.author || '??').slice(0, 2).toUpperCase()}</div>
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
            {post.bounty > 0 && (
              <span className="ml-auto flex items-center gap-2">
                {escrow && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${escrow.status === 'held' ? 'bg-amber-100 text-amber-600' : escrow.status === 'released' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {escrow.status === 'held' ? 'In Escrow' : escrow.status === 'released' ? 'Released' : 'Refunded'}
                  </span>
                )}
                <span className="text-sm font-bold text-green-600">{post.bounty} {post.token || 'USD'}</span>
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {post.image && (
            <img src={post.image} alt={post.title} className="rounded-xl max-h-96 w-full object-cover" />
          )}

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

          {post.poll && <PollBlock post={post} currentUser={currentUser} variant="light" onVote={(optionId) => votePoll.mutate({ post, optionId })} />}

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
            <button onClick={() => toggleSave.mutate({ post })} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-[#9d4f7a]/10 text-[#9d4f7a]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Bookmark size={16} /> {saved ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => toggleRepost.mutate({ post })} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${reposted ? 'bg-[#9d4f7a]/10 text-[#9d4f7a]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Repeat2 size={16} /> {post.reposts || 0}
            </button>
            {post.status === 'open' && !isRequester && (
              <button onClick={handleClaim} disabled={updateStatus.isPending} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#6a3a5a] text-white hover:bg-[#7d4a6a] transition-colors disabled:opacity-50">
                <Lock size={16} /> Claim Task
              </button>
            )}
            {post.status === 'open' && isRequester && post.bounty > 0 && (
              <button onClick={handleRefund} disabled={refundEscrow.isPending} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50">
                Cancel & Refund
              </button>
            )}
            {post.status === 'pending_approval' && isRequester && (
              <button onClick={handleVerify} disabled={releaseEscrow.isPending || !escrow} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50">
                <CheckCircle2 size={16} /> Verify & Release
              </button>
            )}
            {post.status === 'pending_approval' && !isRequester && (
              <span className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-amber-100 text-amber-600"><Lock size={16} /> Awaiting verification</span>
            )}
            {post.status === 'resolved' && (
              <span className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-600"><CheckCircle2 size={16} /> Task Resolved</span>
            )}
          </div>

          {/* Comments */}
          <div className="border-t border-gray-100 pt-4">
            <ThreadedComments post={post} currentUser={currentUser} notifyOwner={notifyOwner} />
          </div>
        </div>
      </div>
    </div>
  );
}