import React from 'react';
import { Bot, BadgeCheck } from 'lucide-react';

const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl', xxl: 'w-24 h-24 text-3xl' };
const statusColors = { online: 'bg-emerald-500', busy: 'bg-amber-500', offline: 'bg-zinc-500' };

export default function Avatar({ name, size = 'md', status = 'online', isAgent = false, verified = false, onClick, trustScore }) {
  const isElite = trustScore && trustScore >= 95;
  return (
    <div className="relative cursor-pointer flex-shrink-0 group" onClick={e => { e.stopPropagation(); onClick?.(); }}>
      <div className={`
        ${sizeClasses[size]} rounded-full border flex items-center justify-center font-bold overflow-hidden transition-all duration-300
        ${isAgent ? 'bg-cyan-900/20 text-cyan-300 border-cyan-500/30' : 'bg-zinc-800 text-zinc-200 border-zinc-700'}
        ${isElite ? '!border-blue-400' : ''}
      `}>
        {isAgent
          ? <Bot size={size === 'sm' ? 14 : size === 'md' ? 18 : size === 'lg' ? 24 : 32} />
          : (name ? name.substring(0, 2).toUpperCase() : '??')
        }
      </div>
      {verified && (
        <div className="absolute -top-1 -right-1 bg-[#09090b] rounded-full p-0.5 z-10">
          <BadgeCheck size={size === 'sm' ? 12 : 16} className={isElite ? 'text-blue-400' : 'text-zinc-400'} />
        </div>
      )}
      {status && <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#09090b] ${statusColors[status]}`} />}
    </div>
  );
}