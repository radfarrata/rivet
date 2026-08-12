import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useTransactions } from './useTransactions';

export function useEscrows() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = base44.entities.Escrow.subscribe(() =>
      queryClient.invalidateQueries({ queryKey: ['rivet-escrows'] })
    );
    return unsub;
  }, [queryClient]);

  return useQuery({
    queryKey: ['rivet-escrows'],
    queryFn: () => base44.entities.Escrow.list('-created_date', 100),
  });
}

export function useCreateEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.Escrow.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-escrows'] }),
  });
}

export function useReleaseEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ escrow, post, currentUser }) => {
      const resolverId = post?.resolverId || escrow.resolverId;
      const resolverName = post?.resolverName || escrow.resolverName;
      await base44.entities.Escrow.update(escrow.id, {
        status: 'released',
        resolverId,
        resolverName,
        releasedAt: new Date().toISOString(),
      });
      const log = [...(post?.auditLog || []), { action: 'Verified & Released', user: currentUser?.full_name || 'Requester', time: 'Just now' }];
      await base44.entities.Post.update(escrow.postId, { status: 'resolved', auditLog: log });
      if (resolverId) {
        base44.entities.Notification.create({ userId: resolverId, type: 'escrow', title: 'Bounty released', message: `Your bounty for "${escrow.taskTitle}" was released.`, read: false });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rivet-escrows'] });
      queryClient.invalidateQueries({ queryKey: ['rivet-posts'] });
    },
  });
}

export function useRefundEscrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ escrow, post, currentUser }) => {
      await base44.entities.Escrow.update(escrow.id, { status: 'refunded' });
      const log = [...(post?.auditLog || []), { action: 'Cancelled & Refunded', user: currentUser?.full_name || 'Requester', time: 'Just now' }];
      await base44.entities.Post.update(escrow.postId, { status: 'resolved', auditLog: log });
      await base44.entities.Transaction.create({ type: 'earned', description: `Escrow refund: ${escrow.taskTitle}`, amount: escrow.amount, status: 'completed', method: 'escrow' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rivet-escrows'] });
      queryClient.invalidateQueries({ queryKey: ['rivet-posts'] });
      queryClient.invalidateQueries({ queryKey: ['rivet-transactions'] });
    },
  });
}

export function useWalletBalance(userId) {
  const txnsQ = useTransactions();
  const escrowsQ = useEscrows();
  const transactions = txnsQ.data || [];
  const escrows = escrowsQ.data || [];
  const isLoading = txnsQ.isLoading || escrowsQ.isLoading;
  const txnSum = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + (t.amount || 0), 0);
  const escrowEarned = escrows.filter(e => e.status === 'released' && userId && e.resolverId === userId).reduce((s, e) => s + (e.amount || 0), 0);
  const held = escrows.filter(e => e.status === 'held' && userId && e.requesterId === userId).reduce((s, e) => s + (e.amount || 0), 0);
  return { balance: txnSum + escrowEarned, held, escrowEarned, isLoading };
}