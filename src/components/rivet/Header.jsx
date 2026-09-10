import React, { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useNotifications } from './useNotifications';

export default function Header({ onMenuClick, onSearchChange, onBellClick, onAvatarClick, currentUser }) {
  const [search, setSearch] = useState('');
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e) => {
    setSearch(e.target.value);
    onSearchChange?.(e.target.value);
  };

  return (
    <header className="sticky top-0 z-20 bg-[#0b0d12]/90 backdrop-blur-xl border-b border-[#1f232e] px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 text-[#b8bcc8] hover:bg-[#151823] rounded-lg transition-colors flex-shrink-0">
          <Menu size={20} />
        </button>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7080]" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search tasks, models, or people..."
              className="w-full bg-[#12141b] border border-[#1f232e] rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder-[#6b7080] focus:outline-none focus:border-[#6d5dfc]/60 focus:ring-2 focus:ring-[#6d5dfc]/20 transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBellClick} className="relative p-2 text-[#b8bcc8] hover:text-white hover:bg-[#151823] rounded-lg transition-colors">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#6d5dfc] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
          </button>
          <div onClick={onAvatarClick} className="w-9 h-9 rounded-full bg-[#1f232e] border border-[#2a2e3d] flex items-center justify-center text-white font-bold text-sm cursor-pointer flex-shrink-0 hover:border-[#6d5dfc] transition-colors">{(currentUser?.full_name || 'You').slice(0, 1).toUpperCase()}</div>
        </div>
      </div>
    </header>
  );
}