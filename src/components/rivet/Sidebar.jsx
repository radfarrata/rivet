import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home, Folder, CheckSquare, Bot, Users, Brain, Trophy, Cpu, Hash, TrendingUp, Lock,
  MessageSquare, MessagesSquare, Calendar, Wallet, ArrowUp, Receipt, Sparkles, ShieldAlert,
  FlaskConical, Map, ChevronRight,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { id: 'home', label: 'Home', icon: <Home size={18} /> },
      { id: 'evaluation-lab', label: 'Run Evaluation', icon: <FlaskConical size={18} /> },
      { id: 'capability-map', label: 'Leaderboards', icon: <Trophy size={18} /> },
      { id: 'expert-workspace', label: 'Expert Workspace', icon: <ShieldAlert size={18} />, href: '/expert' },
      { id: 'projects', label: 'My Projects', icon: <Folder size={18} /> },
      { id: 'feed', label: 'Community', icon: <Users size={18} /> },
    ],
  },
  {
    label: 'BUILD',
    items: [
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
      { id: 'leaderboard', label: 'Contributors', icon: <Map size={18} /> },
    ],
  },
  {
    label: 'COMMUNITY',
    items: [
      { id: 'discover-agents', label: 'Discover Agents', icon: <Sparkles size={18} /> },
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
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsMobileNavOpen(false)} />
      )}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0e1017] border-r border-[#1f232e] flex flex-col z-40 transition-transform duration-300 flex-shrink-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="px-5 py-5 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c6cff] to-[#4f3fd6] flex items-center justify-center shadow-[0_0_18px_rgba(124,108,255,0.45)]">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Rivet</span>
          </div>
          <span className="block text-[11px] text-[#8b90a0]">AI Training, Made Social.</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-hide">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <div className="px-3 py-2 text-[10px] font-semibold text-[#6b7080] uppercase tracking-widest">{group.label}</div>
              )}
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <Link
                    key={item.id}
                    to={item.href || '#'}
                    onClick={item.href ? () => setIsMobileNavOpen?.(false) : (e) => { e.preventDefault(); onNavChange(item.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      activeNav === item.id
                        ? 'bg-[#1a1d29] text-white font-semibold border border-[#2a2e3d]'
                        : 'text-[#b8bcc8] hover:bg-[#151823] hover:text-white'
                    }`}
                  >
                    <span className={activeNav === item.id ? 'text-[#8f82ff]' : ''}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 pb-4 pt-3 border-t border-[#1f232e]">
          <div onClick={onProfileClick} className="rounded-xl p-2.5 flex items-center gap-3 cursor-pointer hover:bg-[#151823] transition-colors">
            <div className="w-9 h-9 rounded-full bg-[#1f232e] border border-[#2a2e3d] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{(currentUser?.full_name || 'You').slice(0, 1).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <span className="text-white text-sm font-semibold truncate block">{currentUser?.full_name || 'You'}</span>
              <span className="text-[11px] text-[#8b90a0] truncate block">{currentUser?.email || ''}</span>
            </div>
            <ChevronRight size={16} className="text-[#6b7080]" />
          </div>
        </div>
      </aside>
    </>
  );
}