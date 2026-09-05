import React from 'react';
import { Star } from 'lucide-react';

export default function ReputationBadge({ reputation }) {
  if (!reputation || reputation.score === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0f2f5] text-[#65676b] border border-[#e4e6eb]">
        <Star size={9} className="opacity-40" />
        <span className="text-[10px] font-semibold">Unrated</span>
      </span>
    );
  }
  const { tier, score } = reputation;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${tier.bg} ${tier.color} border ${tier.ring}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={9} className={i < tier.stars ? 'fill-current' : 'opacity-25'} />
      ))}
      <span className="text-[10px] font-semibold">{tier.name}</span>
      <span className="text-[10px] font-bold opacity-80">{score}</span>
    </span>
  );
}