import React from 'react';
import { CheckCircle2, FileText, TrendingUp, Users, Award } from 'lucide-react';

const ACTIVITY = [
  { id: 1, icon: <CheckCircle2 size={18} className="text-green-500" />, text: 'Training task completed', points: '+120 pts', time: '2h ago' },
  { id: 2, icon: <FileText size={18} className="text-blue-500" />, text: 'Build task approved', points: '+200 pts', time: '5h ago' },
  { id: 3, icon: <TrendingUp size={18} className="text-green-500" />, text: 'Streak bonus', points: '+50 pts', time: '8h ago' },
  { id: 4, icon: <Users size={18} className="text-purple-500" />, text: 'New referral joined', points: '+100 pts', time: '1d ago' },
  { id: 5, icon: <Award size={18} className="text-amber-500" />, text: 'Quality badge earned', points: '+80 pts', time: '1d ago' },
];

export function BalanceCard() {
  return (
    <div className="bg-gradient-to-br from-[#1e1b3a] via-[#2d1b5e] to-[#1a3a5c] rounded-2xl p-6 text-white relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative flex flex-col h-full">
        <p className="text-sm text-white/60 font-medium mb-1">Total Balance</p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold">12,480</span>
          <span className="text-sm text-white/60">pts</span>
        </div>
        <p className="text-xs text-white/50 mb-4">≈ $124.80 USD</p>
        <div className="flex gap-2 mb-5">
          <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors">Withdraw</button>
          <button className="bg-white/10 text-white border border-white/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">Wallet</button>
        </div>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/60">Points to next payout</span>
            <span className="text-xs text-white/60">2,520 pts</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-400 to-blue-400 rounded-full" style={{ width: '16%' }} />
          </div>
          <p className="text-[10px] text-white/40 mt-1">Payout threshold: 15,000 pts</p>
        </div>
      </div>
    </div>
  );
}

export function TodayActivity() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <h3 className="text-base font-bold text-gray-900 mb-4">Today's Activity</h3>
      <div className="space-y-3">
        {ACTIVITY.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.text}</p>
              <p className="text-xs text-gray-400">{item.time}</p>
            </div>
            <span className="text-sm font-bold text-green-600 flex-shrink-0">{item.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}