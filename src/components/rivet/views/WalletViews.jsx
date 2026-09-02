import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Wallet as WalletIcon, TrendingUp, ArrowDown, Clock, ChevronRight, Lock, RotateCcw } from 'lucide-react';
import { useTransactions, useCreateTransaction } from '../useTransactions';
import { useEscrows, useReleaseEscrow, useRefundEscrow, useWalletBalance } from '../useEscrow';
import { usePosts } from '../usePosts';
import CashFlowChart from '../CashFlowChart';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diffMin = Math.floor((Date.now() - d) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `${diffD}d ago`;
  return formatDate(dateStr);
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'earned', label: 'Earned' },
  { id: 'withdrawn', label: 'Withdrawn' },
  { id: 'pending', label: 'Pending' },
];

function SummaryStats({ transactions }) {
  const earned = transactions.filter(t => t.type === 'earned' && t.status === 'completed').reduce((s, t) => s + (t.amount || 0), 0);
  const withdrawn = transactions.filter(t => t.type === 'withdrawn' && t.status === 'completed').reduce((s, t) => s + (t.amount || 0), 0);
  const pending = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + Math.abs(t.amount || 0), 0);

  const stats = [
    { label: 'Total Earned', value: `+${earned.toLocaleString()}`, unit: 'pts', icon: <TrendingUp size={16} />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Withdrawn', value: `${withdrawn.toLocaleString()}`, unit: 'pts', icon: <ArrowDown size={16} />, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Pending', value: `${pending.toLocaleString()}`, unit: 'pts', icon: <Clock size={16} />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>{s.icon}</div>
          <div>
            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            <p className="text-lg font-bold text-gray-900">{s.value} <span className="text-xs text-gray-400 font-normal">{s.unit}</span></p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    completed: 'bg-green-100 text-green-600',
    pending: 'bg-amber-100 text-amber-600',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>;
}

function TransactionRow({ t }) {
  const isEarned = t.amount > 0;
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isEarned ? 'bg-green-100' : 'bg-red-100'}`}>
            {isEarned ? <CheckCircle2 size={14} className="text-green-600" /> : <ArrowUpRight size={14} className="text-red-600" />}
          </div>
          <span className="text-gray-800 font-medium">{t.description}</span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-gray-400 text-xs">{formatRelative(t.created_date)}</td>
      <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
      <td className={`px-5 py-3.5 text-right font-bold ${isEarned ? 'text-green-600' : 'text-red-600'}`}>{isEarned ? '+' : ''}{t.amount} pts</td>
    </tr>
  );
}

function TransactionsTable() {
  const { data: transactions = [], isLoading } = useTransactions();
  const [filter, setFilter] = useState('all');

  const filtered = transactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'pending') return t.status === 'pending';
    return t.type === filter;
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
        <p className="text-sm text-gray-500 mt-0.5">Live history of all your earnings and withdrawals</p>
      </div>

      <SummaryStats transactions={transactions} />

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filter === f.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{f.label}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left font-medium px-5 py-3">Description</th>
                <th className="text-left font-medium px-5 py-3">Date</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-right font-medium px-5 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Loading transactions...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No transactions match this filter.</td></tr>
              ) : (
                filtered.map(t => <TransactionRow key={t.id} t={t} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function WalletHome({ currentUser }) {
  const { data: transactions = [], isLoading } = useTransactions();
  const { balance, held } = useWalletBalance(currentUser?.id);
  const recent = transactions.slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#3a1f2e] via-[#6a3a5a] to-[#3a2540] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4"><WalletIcon size={20} className="text-white/70" /><p className="text-sm text-white/60 font-medium">My Wallet</p></div>
        <div className="flex items-baseline gap-2 mb-1"><span className="text-4xl font-bold">{balance.toLocaleString()}</span><span className="text-sm text-white/60">pts</span></div>
        <p className="text-xs text-white/50 mb-5">≈ ${(balance / 100).toFixed(2)} USD</p>
        <div>
          <div className="flex items-center justify-between mb-1.5"><span className="text-xs text-white/60">Points to next payout</span><span className="text-xs text-white/60">{Math.max(0, 15000 - balance).toLocaleString()} pts</span></div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-400 to-blue-400 rounded-full" style={{ width: `${Math.min(100, (balance / 15000) * 100)}%` }} /></div>
        </div>
      </div>

      <CashFlowChart />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Recent Payments</h3>
          <span className="text-xs text-gray-400">{transactions.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left font-medium px-5 py-2.5">Description</th>
                <th className="text-left font-medium px-5 py-2.5">Date</th>
                <th className="text-left font-medium px-5 py-2.5">Status</th>
                <th className="text-right font-medium px-5 py-2.5">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">Loading...</td></tr>
              ) : recent.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">No transactions yet.</td></tr>
              ) : (
                recent.map(t => <TransactionRow key={t.id} t={t} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function WithdrawForm({ currentUser }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('paypal');
  const [done, setDone] = useState(false);
  const { balance } = useWalletBalance(currentUser?.id);
  const createTxn = useCreateTransaction();

  const handleWithdraw = () => {
    if (Number(amount) < 1000) return;
    createTxn.mutate({
      type: 'withdrawn',
      description: `Withdrawal to ${method === 'paypal' ? 'PayPal' : 'Bank'}`,
      amount: -Number(amount),
      status: 'pending',
      method,
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">Withdrawal Requested!</h3>
        <p className="text-sm text-gray-500">{amount} pts ({(Number(amount) / 100).toFixed(2)} USD) will be sent to your {method === 'paypal' ? 'PayPal' : 'bank account'} within 2-3 business days.</p>
        <button onClick={() => { setDone(false); setAmount(''); }} className="mt-4 text-sm font-semibold text-[#9d4f7a] hover:text-[#b85e92]">Make another withdrawal</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Withdraw Points</h2>
      <p className="text-sm text-gray-500 mb-5">Available: <span className="font-bold text-gray-900">{balance.toLocaleString()} pts</span> (≈ ${(balance / 100).toFixed(2)})</p>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount (points)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter points to withdraw" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
          <p className="text-xs text-gray-400 mt-1">Minimum withdrawal: 1,000 pts</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Withdrawal Method</label>
          <div className="flex gap-2">
            <button onClick={() => setMethod('paypal')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${method === 'paypal' ? 'border-[#9d4f7a] bg-[#9d4f7a]/10 text-[#9d4f7a]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>PayPal</button>
            <button onClick={() => setMethod('bank')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${method === 'bank' ? 'border-[#9d4f7a] bg-[#9d4f7a]/10 text-[#9d4f7a]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Bank Transfer</button>
          </div>
        </div>
        <button onClick={handleWithdraw} disabled={Number(amount) < 1000 || createTxn.isPending} className="w-full bg-[#6a3a5a] hover:bg-[#7d4a6a] disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">Withdraw {amount && `${amount} pts`}</button>
      </div>
    </div>
  );
}

function EscrowStatusBadge({ status }) {
  const styles = { held: 'bg-amber-100 text-amber-600', released: 'bg-green-100 text-green-600', refunded: 'bg-gray-100 text-gray-500' };
  const labels = { held: 'Held', released: 'Released', refunded: 'Refunded' };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>{labels[status]}</span>;
}

function EscrowView({ currentUser }) {
  const { data: escrows = [], isLoading } = useEscrows();
  const { data: posts = [] } = usePosts();
  const releaseEscrow = useReleaseEscrow();
  const refundEscrow = useRefundEscrow();
  const postById = (id) => posts.find(p => p.id === id);

  const held = escrows.filter(e => e.status === 'held' && e.requesterId === currentUser?.id).reduce((s, e) => s + (e.amount || 0), 0);
  const pending = escrows.filter(e => e.status === 'held' && e.requesterId === currentUser?.id && postById(e.postId)?.status === 'pending_approval').length;
  const earned = escrows.filter(e => e.status === 'released' && e.resolverId === currentUser?.id).reduce((s, e) => s + (e.amount || 0), 0);

  const stats = [
    { label: 'Held in Escrow', value: held.toLocaleString(), unit: 'pts', icon: <Lock size={16} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pending Verification', value: pending, unit: '', icon: <Clock size={16} />, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Earned via Bounties', value: earned.toLocaleString(), unit: 'pts', icon: <TrendingUp size={16} />, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Escrow</h2>
        <p className="text-sm text-gray-500 mt-0.5">Bounty payments held until you verify a task is complete</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              <p className="text-lg font-bold text-gray-900">{s.value} {s.unit && <span className="text-xs text-gray-400 font-normal">{s.unit}</span>}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Escrow Ledger</h3>
          <span className="text-xs text-gray-400">{escrows.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left font-medium px-5 py-3">Task</th>
                <th className="text-left font-medium px-5 py-3">Your Role</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-right font-medium px-5 py-3">Amount</th>
                <th className="text-right font-medium px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Loading escrow...</td></tr>
              ) : escrows.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No escrow records yet.</td></tr>
              ) : escrows.map(e => {
                const task = postById(e.postId);
                const isRequester = e.requesterId === currentUser?.id;
                const taskStatus = task?.status;
                const canRelease = isRequester && e.status === 'held' && taskStatus === 'pending_approval';
                const canRefund = isRequester && e.status === 'held' && taskStatus === 'open';
                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5"><span className="text-gray-800 font-medium">{e.taskTitle || 'Untitled'}</span></td>
                    <td className="px-5 py-3.5 text-gray-500">{isRequester ? 'Requester' : 'Resolver'}</td>
                    <td className="px-5 py-3.5"><EscrowStatusBadge status={e.status} /></td>
                    <td className="px-5 py-3.5 text-right font-bold text-gray-900">{e.amount} pts</td>
                    <td className="px-5 py-3.5 text-right">
                      {canRelease && <button onClick={() => releaseEscrow.mutate({ escrow: e, post: task, currentUser })} disabled={releaseEscrow.isPending} className="text-xs font-semibold text-green-600 hover:text-green-700 disabled:opacity-50">Verify & Release</button>}
                      {canRefund && <button onClick={() => refundEscrow.mutate({ escrow: e, post: task, currentUser })} disabled={refundEscrow.isPending} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50"><RotateCcw size={12} /> Refund</button>}
                      {!canRelease && !canRefund && <span className="text-xs text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function WalletViews({ mode = 'wallet', currentUser }) {
  if (mode === 'withdraw') return <WithdrawForm currentUser={currentUser} />;
  if (mode === 'transactions') return <TransactionsTable />;
  if (mode === 'escrow') return <EscrowView currentUser={currentUser} />;
  return <WalletHome currentUser={currentUser} />;
}