import React from 'react';
import { CheckCircle2, FileText, ArrowUpRight, Lock } from 'lucide-react';
import { useTransactions } from './useTransactions';
import { useWalletBalance } from './useEscrow';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffH = Math.floor((now - d) / (1000 * 60 * 60));
  if (diffH < 1) return 'just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

const ICONS = {
  earned: <CheckCircle2 size={18} className="text-green-500" />,
  withdrawn: <ArrowUpRight size={18} className="text-red-500" />,
};

export function BalanceCard({ userId }) {
  const { balance, held, isLoading } = useWalletBalance(userId);

  return (
    <div className="rounded-2xl border border-[#e4e6eb] bg-[#ffffff] p-6 h-full">
      <div className="flex flex-col h-full">
        <p className="text-sm text-[#65676b] font-medium mb-1">Total Balance</p>
        {isLoading ? (
          <div className="h-9 w-32 bg-[#e4e6eb] rounded animate-pulse mb-1" />
        ) : (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-[#050505]">{balance.toLocaleString()}</span>
            <span className="text-sm text-[#65676b]">pts</span>
          </div>
        )}
        <p className="text-xs text-[#65676b] mb-4">≈ ${(balance / 100).toFixed(2)} USD</p>
        {held > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-[#65676b] mb-4">
            <Lock size={12} /> {held.toLocaleString()} pts held in escrow
          </div>
        )}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#65676b]">Points to next payout</span>
            <span className="text-xs text-[#65676b]">{Math.max(0, 15000 - balance).toLocaleString()} pts</span>
          </div>
          <div className="h-2 bg-[#e4e6eb] rounded-full overflow-hidden">
            <div className="h-full bg-[#653653] rounded-full" style={{ width: `${Math.min(100, (balance / 15000) * 100)}%` }} />
          </div>
          <p className="text-[10px] text-[#65676b] mt-1">Payout threshold: 15,000 pts</p>
        </div>
      </div>
    </div>
  );
}

export function TodayActivity() {
  const { data: transactions = [], isLoading } = useTransactions();
  const recent = transactions.slice(0, 5);

  return (
    <div className="rounded-2xl border border-[#e4e6eb] bg-[#ffffff] p-6 h-full">
      <h3 className="text-base font-bold text-[#050505] mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-10 bg-[#f0f2f5] rounded-lg animate-pulse" />)
        ) : recent.length === 0 ? (
          <p className="text-sm text-[#65676b] text-center py-4">No activity yet.</p>
        ) : (
          recent.map((t) => (
            <div key={t.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#f0f2f5] flex items-center justify-center flex-shrink-0">{ICONS[t.type] || <FileText size={18} className="text-[#65676b]" />}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#050505] truncate">{t.description}</p>
                <p className="text-xs text-[#65676b]">{formatDate(t.created_date)}</p>
              </div>
              <span className={`text-sm font-bold flex-shrink-0 ${t.amount > 0 ? 'text-[#31a24c]' : 'text-[#e41e3f]'}`}>{t.amount > 0 ? '+' : ''}{t.amount} pts</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}