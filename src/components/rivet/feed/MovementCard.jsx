import React from 'react';
import Icon from '@/components/Icon';
import { domainLabel } from '../evalModels';

/** Injected signal card: a model's score moving on a domain over time. */
export default function MovementCard({ movement, onOpen }) {
  const up = movement.delta > 0;
  return (
    <button
      onClick={onOpen}
      className="w-full text-left px-4 py-4 border-b border-[#2f3336] bg-[#0c0d10] hover:bg-[#16181c] transition-colors"
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#71767b] uppercase tracking-widest">
        <Icon name="trending" size={10} className="text-[#b06d97]" /> Movement
      </div>
      <p className="text-[15px] text-white mt-1.5 leading-snug">
        <span className="font-bold">{movement.model}</span>{' '}
        {up ? 'gained' : 'dropped'}{' '}
        <span className={`font-bold font-mono ${up ? 'text-[#2fd4a7]' : 'text-[#ff6b6b]'}`}>{up ? '+' : ''}{movement.delta} pts</span>{' '}
        on <span className="font-semibold">{domainLabel(movement.domain)}</span>
      </p>
      <p className="text-[12px] text-[#71767b] mt-1">
        {movement.before} → {movement.after} across {movement.n} evaluations · view the evidence →
      </p>
    </button>
  );
}