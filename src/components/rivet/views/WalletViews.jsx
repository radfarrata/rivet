import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Clock, Wallet as WalletIcon } from 'lucide-react';

const TRANSACTIONS = [
  { id: 't1', type: 'earned', description: 'Build task approved', amount: 200, date: 'Jul 27, 2026', status: 'completed' },
  { id: 't2', type: 'earned', description: 'Training task completed', amount: 120, date: 'Jul 27, 2026', status: 'completed' },
  { id: 't3', type: 'withdrawn', description: 'Withdrawal to PayPal', amount: -500, date: 'Jul 25, 2026', status: 'completed' },
  { id: 't4', type: 'earned', description: 'Streak bonus', amount: 50, date: 'Jul 26, 2026', status: 'completed' },
  { id: 't5', type: 'earned', description: 'Referral bonus', amount: 100, date: 'Jul 25, 2026', status: 'completed' },
  { id: 't6', type: 'withdrawn', description: 'Withdrawal to Bank', amount: -1000, date: 'Jul 20, 2026', status: 'pending' },
  { id: 't7', type: 'earned', description: 'Quality badge earned', amount: 80, date: 'Jul 18, 2026', status: 'completed' },
];

function WalletHome() {
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#1e1b3a] via-[#2d1b5e] to-[#1a3a5c] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4"><WalletIcon size={20} className="text-white/70" /><p className="text-sm text-white/60 font-medium">My Wallet</p></div>
        <div className="flex items-baseline gap-2 mb-1"><span className="text-4xl font-bold">12,480</span><span className="text-sm text-white/60">pts</span></div>
        <p className="text-xs text-white/50 mb-5">≈ $124.80 USD</p>
        <div>
          <div className="flex items-center justify-between mb-1.5"><span className="text-xs text-white/60">Progress to Lv.13</span><span className="text-xs text-white/60">2,520 pts</span></div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-400 to-blue-400 rounded-full" style={{ width: '83%' }} /></div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {TRANSACTIONS.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${t.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {t.amount > 0 ? <CheckCircle2 size={16} className="text-green-600" /> : <ArrowUpRight size={16} className="text-red-600" />}
              </div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800 truncate">{t.description}</p><p className="text-xs text-gray-400">{t.date}</p></div>
              <span className={`text-sm font-bold flex-shrink-0 ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{t.amount > 0 ? '+' : ''}{t.amount} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WithdrawForm() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('paypal');
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">Withdrawal Requested!</h3>
        <p className="text-sm text-gray-500">{amount} pts ({(Number(amount) / 100).toFixed(2)} USD) will be sent to your {method === 'paypal' ? 'PayPal' : 'bank account'} within 2-3 business days.</p>
        <button onClick={() => { setDone(false); setAmount(''); }} className="mt-4 text-sm font-semibold text-violet-600 hover:text-violet-700">Make another withdrawal</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Withdraw Points</h2>
      <p className="text-sm text-gray-500 mb-5">Available: <span className="font-bold text-gray-900">12,480 pts</span> (≈ $124.80)</p>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount (points)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter points to withdraw" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
          <p className="text-xs text-gray-400 mt-1">Minimum withdrawal: 1,000 pts</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Withdrawal Method</label>
          <div className="flex gap-2">
            <button onClick={() => setMethod('paypal')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${method === 'paypal' ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>PayPal</button>
            <button onClick={() => setMethod('bank')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${method === 'bank' ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Bank Transfer</button>
          </div>
        </div>
        <button onClick={() => Number(amount) >= 1000 && setDone(true)} disabled={Number(amount) < 1000} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">Withdraw {amount && `${amount} pts`}</button>
      </div>
    </div>
  );
}

function TransactionsTable() {
  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-gray-900">Transactions</h2><p className="text-sm text-gray-500 mt-0.5">All your earnings and withdrawals</p></div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
              <th className="text-left font-medium px-5 py-3">Description</th>
              <th className="text-left font-medium px-5 py-3">Date</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
              <th className="text-right font-medium px-5 py-3">Amount</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {TRANSACTIONS.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-800 font-medium">{t.description}</td>
                  <td className="px-5 py-3.5 text-gray-400">{t.date}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{t.status}</span>
                  </td>
                  <td className={`px-5 py-3.5 text-right font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{t.amount > 0 ? '+' : ''}{t.amount} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function WalletViews({ mode = 'wallet' }) {
  if (mode === 'withdraw') return <WithdrawForm />;
  if (mode === 'transactions') return <TransactionsTable />;
  return <WalletHome />;
}