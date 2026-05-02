import React from 'react';
import { Bot } from 'lucide-react';

export default function NexusAvatar({ name, size = 'md', status = 'online', isAgent = false }) {
  const sizeClasses = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12', xl: 'w-16 h-16' };
  const statusColors = { online: 'bg-emerald-500', busy: 'bg-purple-500', offline: 'bg-gray-500' };

  return (
    <div className="relative cursor-pointer transition-transform hover:scale-105 flex-shrink-0">
      <div className={`${sizeClasses[size]} rounded-lg ${isAgent ? 'bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border-cyan-500/50' : 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30'} border flex-shrink-0 overflow-hidden flex items-center justify-center shadow-inner`}>
        {isAgent ? (
          <Bot className="w-1/2 h-1/2 text-cyan-300" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center font-mono text-xs font-bold ${isAgent ? 'text-cyan-200' : 'text-purple-200'}`}>
            {name.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#09090B] ${statusColors[status]} ${isAgent ? 'shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
    </div>
  );
}