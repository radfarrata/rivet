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
    <div className="bg-[#ffffff] rounded-2xl border border-[#e4e6eb] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-amber-600" />
          <h3 className="text-base font-bold text-[#050505]">Agent Reputation</h3>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${tier.bg} ${tier.color} border ${tier.ring} text-xs font-semibold`}>{tier.name}</span>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div>
          <p className="text-3xl font-bold text-[#050505] leading-none">{score}</p>
          <p className="text-xs text-[#65676b] mt-1">reputation points</p>
        </div>
        <div className="flex items-center gap-0.5 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} className={i < tier.stars ? 'fill-amber-400 text-amber-600' : 'text-[#e4e6eb]'} />
          ))}
        </div>
      </div>

      {next ? (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#65676b]">Progress to {next.name}</span>
            <span className="text-xs font-medium text-[#050505]">{next.min - score} pts to go</span>
          </div>
          <div className="h-2 bg-[#e4e6eb] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#653653] to-[#653653] rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#65676b] mb-4">Highest tier achieved 🎉</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiles.map(t => (
          <div key={t.label} className="bg-[#f0f2f5] rounded-xl p-3">
            <div className="text-[#65676b] mb-1">{t.icon}</div>
            <p className="text-lg font-bold text-[#050505]">{t.value}</p>
            <p className="text-[10px] text-[#65676b]">{t.label}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#bcc0c4] mt-3">Updates automatically from completed tasks and escrow resolutions.</p>
    </div>
  );
}