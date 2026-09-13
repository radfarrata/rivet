import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCreateTransaction } from './useTransactions';
import { useCreateNotification } from './useNotifications';
import { useEscrows, useReleaseEscrow, useRefundEscrow } from './useEscrow';
import { usePosts, useUpvote, useToggleSave, useToggleRepost, useVotePoll } from './usePosts';
import PollBlock from './PollBlock';
import ThreadedComments from './ThreadedComments';
import { X, ChevronUp, MessageSquare, Code, CheckCircle2, Lock, Send, Bookmark, Repeat2, ListChecks } from 'lucide-react';

export default function PostDetailModal({ post: initialPost, onClose, currentUser, onViewProfile }) {
  const queryClient = useQueryClient();
  const { data: livePosts = [] } = usePosts();
  const post = livePosts.find(item => item.id === initialPost.id) || initialPost;

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

  const upvote = useUpvote();

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

  const statusBadge = post.status === 'open' ? 'bg-[#653653]/15 text-[#653653]' : post.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : 'bg-[#31a24c]/10 text-[#31a24c]';
  const statusLabel = post.status === 'pending_approval' ? 'In Progress' : post.status === 'resolved' ? 'Resolved' : 'Open';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-[#ffffff] rounded-none sm:rounded-2xl w-full max-w-2xl max-h-screen sm:max-h-[85vh] overflow-y-auto border border-[#e4e6eb]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-[#ffffff]/90 backdrop-blur-md border-b border-[#e4e6eb] px-4 sm:px-6 py-4 flex items-center justify-between sm:rounded-t-2xl z-10">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { onViewProfile?.(post); onClose(); }}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#653653] to-[#653653] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{(post.author || '??').slice(0, 2).toUpperCase()}</div>
            <div>
              <p className="text-sm font-semibold text-[#050505]">{post.author || 'Unknown'}</p>
              <p className="text-xs text-[#65676b]">{post.handle || '@unknown'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#65676b] hover:text-[#050505] hover:bg-[#f0f2f5] rounded-lg transition-colors"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {post.isAgent && <span className="text-[10px] bg-[#653653]/15 text-[#653653] px-2 py-0.5 rounded-full font-medium">AI Agent</span>}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge}`}>{statusLabel}</span>
            {post.bounty > 0 && (
              <span className="ml-auto flex items-center gap-2">
                {escrow && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${escrow.status === 'held' ? 'bg-amber-100 text-amber-700' : escrow.status === 'released' ? 'bg-[#31a24c]/10 text-[#31a24c]' : 'bg-[#f0f2f5] text-[#65676b]'}`}>
                    {escrow.status === 'held' ? 'In Escrow' : escrow.status === 'released' ? 'Released' : 'Refunded'}
                  </span>
                )}
                <span className="text-sm font-bold text-[#31a24c]">{post.bounty} {post.token || 'USD'}</span>
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-[#050505]">{post.title}</h2>
          <p className="text-sm text-[#1c1e21] leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {post.image && (
            <img src={post.image} alt={post.title} className="rounded-xl max-h-96 w-full object-cover border border-[#e4e6eb]" />
          )}

          {post.tags?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {post.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0f2f5] text-[#65676b] font-medium">{tag}</span>)}
            </div>
          )}

          {/* Task Brief */}
          {(post.deliverables || post.qualityCriteria || post.deadline || (post.skills || []).length > 0) && (
            <div className="rounded-xl border border-[#653653]/30 bg-[#653653]/5 p-4 space-y-3">
              <p className="text-xs font-semibold text-[#653653] uppercase tracking-wide flex items-center gap-1.5">
                <ListChecks size={14} /> Task Brief
              </p>
              {post.skills?.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-[#65676b] mb-1">Skills Required</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {post.skills.map(s => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#653653] font-medium border border-[#653653]/20">{s}</span>)}
                  </div>
                </div>
              )}
              {post.deliverables && (
                <div>
                  <p className="text-[11px] font-semibold text-[#65676b] mb-1">Expected Deliverables</p>
                  <p className="text-sm text-[#1c1e21] whitespace-pre-wrap leading-relaxed">{post.deliverables}</p>
                </div>
              )}
              {post.qualityCriteria && (
                <div>
                  <p className="text-[11px] font-semibold text-[#65676b] mb-1">Quality Criteria</p>
                  <p className="text-sm text-[#1c1e21] whitespace-pre-wrap leading-relaxed">{post.qualityCriteria}</p>
                </div>
              )}
              {post.deadline && (
                <div>
                  <p className="text-[11px] font-semibold text-[#65676b] mb-1">Deadline</p>
                  <p className="text-sm font-medium text-[#653653]">
                    {new Date(post.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Code Snippet */}
          {post.codeSnippet && (
            <div className="rounded-xl border border-[#e4e6eb] overflow-hidden">
              <div className="bg-[#f0f2f5] px-4 py-2 flex items-center gap-2 border-b border-[#e4e6eb]">
                <Code size={14} className="text-[#65676b]" />
                <span className="text-xs font-medium text-[#65676b]">Code</span>
              </div>
              <pre className="bg-[#f0f2f5] text-gray-700 text-xs p-4 overflow-x-auto font-mono"><code>{post.codeSnippet}</code></pre>
            </div>
          )}

          {/* Proposed Fix */}
          {post.proposedFix && (
            <div className="rounded-xl border border-[#31a24c]/40 overflow-hidden">
              <div className="bg-[#31a24c]/10 px-4 py-2 flex items-center gap-2 border-b border-[#31a24c]/40">
                <CheckCircle2 size={14} className="text-[#31a24c]" />
                <span className="text-xs font-medium text-[#31a24c]">Proposed Solution</span>
              </div>
              <pre className="bg-[#f0f2f5] text-emerald-700 text-xs p-4 overflow-x-auto font-mono"><code>{post.proposedFix}</code></pre>
            </div>
          )}

          {post.poll && <PollBlock post={post} currentUser={currentUser} onVote={(optionId) => votePoll.mutate({ post, optionId })} />}

          {/* Audit Log */}
          {post.auditLog?.length > 0 && (
            <div className="bg-[#f0f2f5] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#65676b] uppercase tracking-wide mb-2">Activity Log</p>
              <div className="space-y-1.5">
                {post.auditLog.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-[#65676b] w-20 flex-shrink-0">{entry.time || '—'}</span>
                    <span className="font-medium text-[#050505]">{entry.action}</span>
                    {entry.user && <span className="text-[#65676b]">by {entry.user}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={() => upvote.mutate({ id: post.id, upvotes: post.upvotes })} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#f0f2f5] text-[#050505] hover:bg-[#e4e6eb] active:scale-90 transition-all">
              <ChevronUp size={16} /> {post.upvotes || 0}
            </button>
            <button onClick={() => toggleSave.mutate({ post })} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-[#653653]/15 text-[#653653]' : 'bg-[#f0f2f5] text-[#050505] hover:bg-[#e4e6eb]'}`}>
              <Bookmark size={16} /> {saved ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => toggleRepost.mutate({ post })} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${reposted ? 'bg-[#653653]/15 text-[#653653]' : 'bg-[#f0f2f5] text-[#050505] hover:bg-[#e4e6eb]'}`}>
              <Repeat2 size={16} /> {post.reposts || 0}
            </button>
            {post.status === 'open' && !isRequester && (
              <button onClick={handleClaim} disabled={updateStatus.isPending} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#653653] text-white hover:bg-[#522b42] transition-colors disabled:opacity-50">
                <Lock size={16} /> Claim Task
              </button>
            )}
            {post.status === 'open' && isRequester && post.bounty > 0 && (
              <button onClick={handleRefund} disabled={refundEscrow.isPending} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#f0f2f5] text-[#050505] hover:bg-[#e4e6eb] transition-colors disabled:opacity-50">
                Cancel & Refund
              </button>
            )}
            {post.status === 'pending_approval' && isRequester && (
              <button onClick={handleVerify} disabled={releaseEscrow.isPending || !escrow} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#42b72a] text-white hover:bg-[#36a420] transition-colors disabled:opacity-50">
                <CheckCircle2 size={16} /> Verify & Release
              </button>
            )}
            {post.status === 'pending_approval' && !isRequester && (
              <span className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-amber-100 text-amber-700"><Lock size={16} /> Awaiting verification</span>
            )}
            {post.status === 'resolved' && (
              <span className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#31a24c]/10 text-[#31a24c]"><CheckCircle2 size={16} /> Task Resolved</span>
            )}
          </div>

          {/* Comments */}
          <div className="border-t border-[#e4e6eb] pt-4">
            <ThreadedComments post={post} currentUser={currentUser} notifyOwner={notifyOwner} />
          </div>
        </div>
      </div>
    </div>
  );
}