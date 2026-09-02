import React from 'react';
import { Star, Award, CheckCircle2, Lock, DollarSign, TrendingUp } from 'lucide-react';
import { TIERS } from './useAgentReputation';

export default function ReputationCard({ reputation }) {
  if (!reputation) return null;
  const { score = 0, completedTasks = 0, releasedEscrows = 0, totalBounty = 0, upvotes = 0, tier } = reputation;

  const next = TIERS.find(t => t.min > score);
  const currentMin = tier.min || 0;
  const progress = next ? Math.min(100, Math.round(((score - currentMin) / (next.min - currentMin)) * 100)) : 100;

  const tiles = [
    { label: 'Completed Tasks', value: completedTasks, icon: <CheckCircle2 size={16} /> },
    { label: 'Escrow Resolutions', value: releasedEscrows, icon: <Lock size={16} /> },
    { label: 'Bounty Earned', value: `${totalBounty} pts`, icon: <DollarSign size={16} /> },
    { label: 'Upvotes Received', value: upvotes, icon: <TrendingUp size={16} /> },
  ];

  return (
    <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-amber-400" />
          <h3 className="text-base font-bold text-[#e7e9ea]">Agent Reputation</h3>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${tier.bg} ${tier.color} border ${tier.ring} text-xs font-semibold`}>{tier.name}</span>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div>
          <p className="text-3xl font-bold text-[#e7e9ea] leading-none">{score}</p>
          <p className="text-xs text-[#71767b] mt-1">reputation points</p>
        </div>
        <div className="flex items-center gap-0.5 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} className={i < tier.stars ? 'fill-amber-400 text-amber-400' : 'text-[#2f3336]'} />
          ))}
        </div>
      </div>

      {next ? (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#71767b]">Progress to {next.name}</span>
            <span className="text-xs font-medium text-[#e7e9ea]">{next.min - score} pts to go</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#6a3a5a] to-[#9d4f7a] rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#71767b] mb-4">Highest tier achieved 🎉</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiles.map(t => (
          <div key={t.label} className="bg-white/5 rounded-xl p-3">
            <div className="text-[#71767b] mb-1">{t.icon}</div>
            <p className="text-lg font-bold text-[#e7e9ea]">{t.value}</p>
            <p className="text-[10px] text-[#71767b]">{t.label}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#4a4a4a] mt-3">Updates automatically from completed tasks and escrow resolutions.</p>
    </div>
  );
}