import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/Icon';

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'explore-tasks', label: 'Explore Tasks', icon: 'search' },
      { id: 'evaluation-lab', label: 'Run Evaluation', icon: 'flask' },
      { id: 'capability-map', label: 'Leaderboards', icon: 'trophy' },
      { id: 'expert-workspace', label: 'Expert Workspace', icon: 'shield' },
      { id: 'projects', label: 'My Projects', icon: 'folder' },
      { id: 'feed', label: 'Community', icon: 'users' },
    ],
  },
  {
    label: 'YOUR WORKSPACE',
    items: [
      { id: 'saved-tasks', label: 'Saved Tasks', icon: 'bookmark' },
      { id: 'custom-datasets', label: 'Custom Datasets', icon: 'database' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
  {
    label: 'BUILD',
    items: [
      { id: 'build-tasks', label: 'My Tasks', icon: 'tasks' },
      { id: 'ai-assistants', label: 'AI Assistants', icon: 'bot' },
      { id: 'teams', label: 'Teams', icon: 'users' },
    ],
  },
  {
    label: 'TRAIN',
    items: [
      { id: 'training-hub', label: 'Training Hub', icon: 'brain' },
      { id: 'agent-training', label: 'Agent Training', icon: 'cpu' },
      { id: 'agent-analytics', label: 'Analytics', icon: 'trending' },
      { id: 'train-tasks', label: 'My Tasks', icon: 'tasks' },
      { id: 'leaderboard', label: 'Contributors', icon: 'map' },
    ],
  },
  {
    label: 'COMMUNITY',
    items: [
      { id: 'discover-agents', label: 'Discover Agents', icon: 'sparkles' },
      { id: 'discussions', label: 'Discussions', icon: 'discussions' },
      { id: 'chat', label: 'Chat', icon: 'hash' },
      { id: 'events', label: 'Events', icon: 'calendar' },
    ],
  },
  {
    label: 'WALLET',
    items: [
      { id: 'wallet', label: 'Wallet', icon: 'wallet' },
      { id: 'escrow', label: 'Escrow', icon: 'lock' },
      { id: 'withdraw', label: 'Withdraw', icon: 'arrow-up' },
      { id: 'transactions', label: 'Transactions', icon: 'receipt' },
    ],
  },
];

export default function Sidebar({ activeNav, onNavChange, isMobileOpen, setIsMobileNavOpen, onProfileClick, currentUser }) {
  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsMobileNavOpen(false)} />
      )}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-black border-r border-[#2f3336] flex flex-col z-40 transition-transform duration-300 flex-shrink-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="px-5 py-5 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8a4a73] to-[#4a2740] flex items-center justify-center shadow-[0_0_18px_rgba(101,54,83,0.6)]">
              <Icon name="sparkles" size={15} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Rivet</span>
          </div>
          <span className="block text-[11px] text-[#71767b]">Real Tasks. Real Evaluation. Better AI.</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-hide">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <div className="px-3 py-2 text-[10px] font-semibold text-[#71767b] uppercase tracking-widest">{group.label}</div>
              )}
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <Link
                    key={item.id}
                    to="#"
                    onClick={(e) => { e.preventDefault(); onNavChange(item.id); }}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-full text-[15px] transition-colors ${
                      activeNav === item.id
                        ? 'bg-white/5 text-white font-bold'
                        : 'text-[#e7e9ea] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon name={item.icon} size={18} className={`w-5 text-center ${activeNav === item.id ? 'text-[#b06d97]' : 'text-[#71767b]'}`} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 pb-4 pt-3 border-t border-[#2f3336]">
          <div onClick={onProfileClick} className="rounded-full p-2.5 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
            <div className="w-9 h-9 rounded-full bg-[#1f232e] border border-[#2f3336] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{(currentUser?.full_name || 'You').slice(0, 1).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <span className="text-white text-sm font-semibold truncate block">{currentUser?.full_name || 'You'}</span>
              <span className="text-[11px] text-[#71767b] truncate block">{currentUser?.headline || currentUser?.email || ''}</span>
            </div>
            <Icon name="chevron-right" size={13} className="text-[#71767b]" />
          </div>
        </div>
      </aside>
    </>
  );
}