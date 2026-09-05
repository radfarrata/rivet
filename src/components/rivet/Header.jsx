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
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-[#e4e6eb] px-4 md:px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 text-[#65676b] hover:bg-[#f0f2f5] rounded-full transition-colors flex-shrink-0">
          <Menu size={20} />
        </button>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71767b]" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search projects, tasks, or people..."
              className="w-full bg-[#f0f2f5] border border-transparent rounded-full py-2 pl-9 pr-3 text-sm text-[#050505] placeholder-[#65676b] focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#1877f2]/20 transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBellClick} className="relative p-2 text-[#65676b] hover:text-[#050505] hover:bg-[#f0f2f5] rounded-full transition-colors">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
          </button>
          <div onClick={onAvatarClick} className="w-9 h-9 rounded-full bg-[#1877f2] flex items-center justify-center text-white font-bold text-sm cursor-pointer flex-shrink-0 hover:opacity-90 transition-opacity">{(currentUser?.full_name || 'You').slice(0, 2).toUpperCase()}</div>
        </div>
      </div>
    </header>
  );
}