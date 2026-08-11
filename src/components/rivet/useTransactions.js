import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

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
    queryFn: () => base44.entities.Transaction.list('-created_date', 100),
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