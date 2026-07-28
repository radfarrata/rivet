import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const INITIAL_TRANSACTIONS = [
  { type: 'earned', description: 'Build task approved', amount: 200, status: 'completed' },
  { type: 'earned', description: 'Training task completed', amount: 120, status: 'completed' },
  { type: 'withdrawn', description: 'Withdrawal to PayPal', amount: -500, status: 'completed', method: 'paypal' },
  { type: 'earned', description: 'Streak bonus', amount: 50, status: 'completed' },
  { type: 'earned', description: 'Referral bonus', amount: 100, status: 'completed' },
  { type: 'withdrawn', description: 'Withdrawal to Bank', amount: -1000, status: 'pending', method: 'bank' },
  { type: 'earned', description: 'Quality badge earned', amount: 80, status: 'completed' },
];

export function useTransactions() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = base44.entities.Transaction.subscribe(() =>
      queryClient.invalidateQueries({ queryKey: ['rivet-transactions'] })
    );
    return unsub;
  }, [queryClient]);

  return useQuery({
    queryKey: ['rivet-transactions'],
    queryFn: async () => {
      const data = await base44.entities.Transaction.list('-created_date', 100);
      if (data.length === 0) {
        await base44.entities.Transaction.bulkCreate(INITIAL_TRANSACTIONS);
        return base44.entities.Transaction.list('-created_date', 100);
      }
      return data;
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rivet-transactions'] }),
  });
}

export function useBalance() {
  const { data: transactions = [] } = useTransactions();
  return transactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
}