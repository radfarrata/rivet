import React, { useMemo } from 'react';
import { ComposedChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Bar, Line, Legend } from 'recharts';
import { useTransactions } from './useTransactions';
import { useEscrows } from './useEscrow';
import { TrendingUp } from 'lucide-react';

const DAYS = 14;

const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
const labelFor = (key) => new Date(key + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function Stat({ label, value, color, dot }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
      <div>
        <p className="text-[10px] text-[#71767b] uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-bold ${color}`}>{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function CashFlowChart() {
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: escrows = [], isLoading: escLoading } = useEscrows();

  const data = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const buckets = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const k = dayKey(d);
      buckets.push({ key: k, date: labelFor(k), earnings: 0, withdrawals: 0, escrowHeld: 0, escrowReleased: 0 });
    }
    const map = new Map(buckets.map(b => [b.key, b]));

    transactions.forEach(t => {
      const b = map.get(dayKey(t.created_date));
      if (!b || t.status !== 'completed') return;
      if (t.type === 'earned') b.earnings += t.amount || 0;
      else if (t.type === 'withdrawn') b.withdrawals += Math.abs(t.amount || 0);
    });

    escrows.forEach(e => {
      const cb = map.get(dayKey(e.created_date));
      if (cb && e.status === 'held') cb.escrowHeld += e.amount || 0;
      if (e.releasedAt) {
        const rb = map.get(dayKey(e.releasedAt));
        if (rb && e.status === 'released') rb.escrowReleased += e.amount || 0;
      }
    });

    return buckets;
  }, [transactions, escrows]);

  const totals = useMemo(() => ({
    earnings: data.reduce((s, d) => s + d.earnings, 0),
    withdrawals: data.reduce((s, d) => s + d.withdrawals, 0),
    held: data.reduce((s, d) => s + d.escrowHeld, 0),
    released: data.reduce((s, d) => s + d.escrowReleased, 0),
  }), [data]);

  const empty = data.every(d => !d.earnings && !d.withdrawals && !d.escrowHeld && !d.escrowReleased);

  return (
    <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-[#9d4f7a]" />
          <h3 className="text-base font-bold text-[#e7e9ea]">Cash Flow</h3>
        </div>
        <span className="text-xs text-[#71767b]">Last 14 days</span>
      </div>
      <p className="text-xs text-[#71767b] mb-4 mt-0.5">Transaction volumes and escrow activity over time</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Earned" value={totals.earnings} color="text-emerald-400" dot="bg-emerald-500" />
        <Stat label="Withdrawn" value={totals.withdrawals} color="text-red-400" dot="bg-red-500" />
        <Stat label="Escrow Held" value={totals.held} color="text-amber-400" dot="bg-amber-500" />
        <Stat label="Escrow Released" value={totals.released} color="text-blue-400" dot="bg-blue-500" />
      </div>

      <div className="h-64">
        {(txLoading || escLoading) ? (
          <div className="h-full flex items-center justify-center text-sm text-[#71767b]">Loading cash flow…</div>
        ) : empty ? (
          <div className="h-full flex items-center justify-center text-sm text-[#71767b]">No activity in this period.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2f3336" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71767b' }} tickLine={false} axisLine={{ stroke: '#2f3336' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: '#71767b' }} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #2f3336', backgroundColor: '#16181c', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="escrowHeld" name="Escrow Held" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={8} />
              <Bar dataKey="escrowReleased" name="Escrow Released" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={8} />
              <Line type="monotone" dataKey="earnings" name="Earned" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="withdrawals" name="Withdrawn" stroke="#f87171" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}