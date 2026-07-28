import React, { useState } from 'react';
import { Search, Gift, Bell, Menu } from 'lucide-react';

export default function Header({ onMenuClick, onSearchChange, onBellClick, onAvatarClick }) {
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    setSearch(e.target.value);
    onSearchChange?.(e.target.value);
  };

  return (
    <header className="sticky top-0 z-20 bg-[#F8F9FC]/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
          <Menu size={20} />
        </button>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search projects, tasks, or people..."
              className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Gift size={20} />
          </button>
          <button onClick={onBellClick} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
          </button>
          <div onClick={onAvatarClick} className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer flex-shrink-0 hover:opacity-90 transition-opacity">AM</div>
        </div>
      </div>
    </header>
  );
}