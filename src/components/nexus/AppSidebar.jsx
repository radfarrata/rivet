import React from 'react';
import { Building, ChevronDown, Settings, Check, Terminal, BarChart2, MessageSquare, Bell, CreditCard, Briefcase, X, Menu } from 'lucide-react';
import Avatar from './Avatar';
import { SYNDICATES, WORKSPACES } from './appData';

function SidebarIcon({ active, onClick, icon, title, badge }) {
  return (
    <div className="relative group cursor-pointer w-full flex justify-center mt-1" onClick={onClick} title={title}>
      <div className={`absolute left-0 w-1 rounded-r-full transition-all duration-300 ${active ? 'h-8 bg-zinc-400' : 'h-0 bg-zinc-800 group-hover:h-4'}`} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative ${active ? 'border bg-zinc-800 text-white border-zinc-700' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}>
        {badge && <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />}
        {icon}
      </div>
    </div>
  );
}

export function MobileTopBar({ isMobileNavOpen, setIsMobileNavOpen }) {
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#09090b] z-40 fixed top-0 w-full">
      <div className="flex items-center gap-2 text-white font-bold tracking-tight text-sm">
        <div className="w-6 h-6 bg-zinc-100 rounded flex items-center justify-center">
          <div className="w-3 h-0.5 bg-zinc-900 mb-0.5" />
          <div className="w-3 h-0.5 bg-zinc-900" />
        </div>
        Execution OS
      </div>
      <button onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className="p-2 text-zinc-400 hover:text-white">
        {isMobileNavOpen ? <X size={20}/> : <Menu size={20}/>}
      </button>
    </div>
  );
}

export default function AppSidebar({
  currentUser, activeSyndicate, setActiveSyndicate,
  activeView, openView, activeWorkspace, setActiveWorkspace,
  isViewingProfile, openMyProfile, setShowWorkspaceSettings,
  isMobileNavOpen, setIsMobileNavOpen,
}) {
  return (
    <aside className={`
      fixed md:relative inset-y-0 left-0 w-[72px] flex flex-col items-center py-6 border-r border-zinc-800 bg-[#09090b] z-50 transition-transform duration-300 md:translate-x-0
      ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Logo */}
      <div className="hidden md:flex w-10 h-10 rounded-xl bg-zinc-100 items-center justify-center mb-6 cursor-pointer" onClick={() => { openView('network'); setIsMobileNavOpen(false); }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#18181b"/>
          <path d="M7 12L12 7L17 12" stroke="#e4e4e7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 17L12 12L17 17" stroke="#e4e4e7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Workspace switcher */}
      <div className="w-full px-2 mb-6 group relative">
        <div className="w-10 h-10 mx-auto bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors">
          <Building size={16} className="text-zinc-400 mb-0.5"/>
          <ChevronDown size={10} className="text-zinc-600"/>
        </div>
        <div className="absolute left-14 top-0 bg-zinc-900 border border-zinc-800 rounded-lg p-2 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50 w-48 hidden md:block">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 px-2">Workspaces</div>
          {WORKSPACES.map(ws => (
            <div key={ws.id} onClick={() => setActiveWorkspace(ws)}
              className={`px-3 py-2 rounded-md text-sm cursor-pointer flex items-center justify-between ${activeWorkspace?.id === ws.id ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}>
              <div className="flex items-center gap-2">
                <span>{ws.name}</span>
                {ws.tier === 'Pro' && <span className="text-[8px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-1 py-0.5 rounded font-mono uppercase">PRO</span>}
              </div>
              {activeWorkspace?.id === ws.id && <Check size={14}/>}
            </div>
          ))}
          <div className="border-t border-zinc-800 mt-2 pt-2">
            <div onClick={() => setShowWorkspaceSettings(true)} className="px-3 py-2 rounded-md text-sm cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center gap-2">
              <Settings size={14}/> Manage Workspace
            </div>
          </div>
        </div>
      </div>

      {/* Domains */}
      <div className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto scrollbar-hide">
        <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest w-full text-center mb-1">Domains</div>
        {SYNDICATES.map(syn => {
          const isActive = activeSyndicate === syn.id && activeView === 'network' && !isViewingProfile;
          return (
            <div key={syn.id} className="relative group cursor-pointer w-full flex justify-center" title={syn.name}
              onClick={() => { setActiveSyndicate(syn.id); openView('network'); setIsMobileNavOpen(false); }}>
              <div className={`absolute left-0 w-1 rounded-r-full transition-all duration-300 ${isActive ? 'h-8 bg-zinc-400' : 'h-0 bg-zinc-800 group-hover:h-4'}`}/>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}>
                {syn.icon}
              </div>
            </div>
          );
        })}
        <div className="w-6 border-b border-zinc-800 my-2"/>
        <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest w-full text-center mb-1">Execution</div>
        <SidebarIcon active={activeView === 'claimed'}  onClick={() => { openView('claimed');  setIsMobileNavOpen(false); }} icon={<Briefcase size={20}/>}   title="Claimed Work"/>
        <SidebarIcon active={activeView === 'payments'} onClick={() => { openView('payments'); setIsMobileNavOpen(false); }} icon={<CreditCard size={20}/>}   title="Payments"/>
        <div className="w-6 border-b border-zinc-800 my-2"/>
        <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest w-full text-center mb-1">Network</div>
        <SidebarIcon active={activeView === 'studio'}      onClick={() => { openView('studio');      setIsMobileNavOpen(false); }} icon={<Terminal size={20}/>}    title="Agent Studio"/>
        <SidebarIcon active={activeView === 'performance'} onClick={() => { openView('performance'); setIsMobileNavOpen(false); }} icon={<BarChart2 size={20}/>}   title="Performance Index"/>
        <SidebarIcon active={activeView === 'messages'}    onClick={() => { openView('messages');    setIsMobileNavOpen(false); }} icon={<MessageSquare size={20}/>} title="Comms"/>
        <SidebarIcon active={activeView === 'notifications'} badge onClick={() => { openView('notifications'); setIsMobileNavOpen(false); }} icon={<Bell size={20}/>} title="Notifications"/>
      </div>

      {/* Profile */}
      <div className="mt-auto w-full flex flex-col items-center pb-4 md:pb-0 gap-3 pt-4 border-t border-zinc-800">
        <div className={`cursor-pointer rounded-full transition-all p-0.5 ${isViewingProfile ? 'ring-2 ring-zinc-500' : 'hover:ring-2 hover:ring-zinc-700'}`}
          onClick={openMyProfile} title="Your Entity Identity">
          <Avatar name={currentUser?.full_name || 'Me'} size="md" status="online" verified={true}/>
        </div>
      </div>
    </aside>
  );
}