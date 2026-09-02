import React from 'react';
import {
  Home, Folder, CheckSquare, Bot, Users, Brain, Trophy, Cpu, Hash, TrendingUp, Lock,
  MessageSquare, MessagesSquare, Calendar, Wallet, ArrowUp, Receipt,
} from 'lucide-react';
import RivetIcon from './RivetLogo';

const NAV_GROUPS = [
  {
    label: null,
    items: [{ id: 'home', label: 'Home', icon: <Home size={18} /> }],
  },
  {
    label: 'BUILD',
    items: [
      { id: 'projects', label: 'Projects', icon: <Folder size={18} /> },
      { id: 'build-tasks', label: 'My Tasks', icon: <CheckSquare size={18} /> },
      { id: 'ai-assistants', label: 'AI Assistants', icon: <Bot size={18} /> },
      { id: 'teams', label: 'Teams', icon: <Users size={18} /> },
    ],
  },
  {
    label: 'TRAIN',
    items: [
      { id: 'training-hub', label: 'Training Hub', icon: <Brain size={18} /> },
      { id: 'agent-training', label: 'Agent Training', icon: <Cpu size={18} /> },
      { id: 'agent-analytics', label: 'Analytics', icon: <TrendingUp size={18} /> },
      { id: 'train-tasks', label: 'My Tasks', icon: <CheckSquare size={18} /> },
      { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
    ],
  },
  {
    label: 'COMMUNITY',
    items: [
      { id: 'feed', label: 'Feed', icon: <MessageSquare size={18} /> },
      { id: 'discussions', label: 'Discussions', icon: <MessagesSquare size={18} /> },
      { id: 'chat', label: 'Chat', icon: <Hash size={18} /> },
      { id: 'events', label: 'Events', icon: <Calendar size={18} /> },
    ],
  },
  {
    label: 'WALLET',
    items: [
      { id: 'wallet', label: 'Wallet', icon: <Wallet size={18} /> },
      { id: 'escrow', label: 'Escrow', icon: <Lock size={18} /> },
      { id: 'withdraw', label: 'Withdraw', icon: <ArrowUp size={18} /> },
      { id: 'transactions', label: 'Transactions', icon: <Receipt size={18} /> },
    ],
  },
];

export default function Sidebar({ activeNav, onNavChange, isMobileOpen, setIsMobileNavOpen, onProfileClick, currentUser }) {
  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setIsMobileNavOpen(false)} />
      )}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-black border-r border-[#2f3336] flex flex-col z-40 transition-transform duration-300 flex-shrink-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="w-9 h-9 rounded-xl bg-[#6a3a5a] flex items-center justify-center">
            <RivetIcon size={24} />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">rivet</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-hide">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <div className="px-3 py-2 text-[10px] font-semibold text-[#71767b] uppercase tracking-widest">{group.label}</div>
              )}
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onNavChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${
                      activeNav === item.id
                        ? 'bg-[#9d4f7a]/10 text-[#9d4f7a] font-semibold'
                        : 'text-[#e7e9ea] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-4 pt-2 border-t border-[#2f3336]">
          <div onClick={onProfileClick} className="rounded-full p-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#1d9bf0] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{(currentUser?.full_name || 'You').slice(0, 2).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <span className="text-[#e7e9ea] text-sm font-semibold truncate block">{currentUser?.full_name || 'You'}</span>
              <span className="text-xs text-[#71767b] truncate block">{currentUser?.email || ''}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}