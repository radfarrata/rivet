import React from 'react';
import { X as XIcon, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConcentricLogo from './ConcentricLogo';
import NexusAvatar from './NexusAvatar';
import { SYNDICATES, CURRENT_USER } from './data';

const MenuIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export function MobileHeader({ isMobileNavOpen, setIsMobileNavOpen }) {
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#050507]/90 backdrop-blur-md z-40">
      <div className="flex items-center gap-2 text-white font-bold tracking-tight">
        <ConcentricLogo size={20} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.6)]" /> Nexus OS
      </div>
      <button onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className="p-2 text-gray-400 hover:text-white">
        {isMobileNavOpen ? <XIcon /> : <MenuIcon />}
      </button>
    </div>
  );
}

export default function SyndicateRail({ activeSyndicate, setActiveSyndicate, setActivePost, isMobileNavOpen, setIsMobileNavOpen }) {
  const navigate = useNavigate();
  return (
    <aside className={`
      absolute md:relative z-40 h-[calc(100vh-53px)] md:h-screen w-full md:w-[72px] 
      bg-[#050507]/95 md:bg-[#050507]/90 backdrop-blur-2xl border-r border-white/5 
      flex flex-col items-center py-4 flex-shrink-0 transition-transform duration-300
      ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="hidden md:flex w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.3)] mb-8 cursor-pointer border border-white/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <ConcentricLogo size={24} className="text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
      </div>

      <div className="flex-1 w-full space-y-2 md:space-y-4 flex flex-col items-center px-4 md:px-0">
        <div className="md:hidden w-full text-xs font-mono text-gray-500 uppercase tracking-widest mb-2 px-2 border-b border-white/10 pb-2">Syndicates</div>
        {SYNDICATES.map((syn) => {
          const isActive = activeSyndicate === syn.id;
          return (
            <div
              key={syn.id}
              className="relative group cursor-pointer flex items-center md:justify-center w-full"
              onClick={() => { setActiveSyndicate(syn.id); setActivePost(null); setIsMobileNavOpen(false); }}
              title={syn.name}
            >
              <div className={`absolute left-0 w-1 rounded-r-full transition-all duration-300 ${isActive ? 'h-8 md:h-8 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'h-0 bg-white/20 group-hover:h-4'}`} />
              <div className={`
                flex md:w-12 w-full h-12 md:rounded-xl rounded-lg items-center md:justify-center px-4 md:px-0
                transition-all duration-300 
                ${isActive ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-white/5 text-gray-500 border-transparent group-hover:bg-white/10 group-hover:text-gray-300'}
                border
              `}>
                {React.cloneElement(syn.icon, { size: 22 })}
                <span className="md:hidden ml-3 font-medium text-sm">{syn.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="md:w-auto w-full px-4 md:px-0 mb-2">
        <div
          className="flex md:w-12 w-full h-12 md:rounded-xl rounded-lg items-center md:justify-center px-4 md:px-0 transition-all duration-300 bg-white/5 text-gray-500 border border-transparent hover:bg-white/10 hover:text-gray-300 cursor-pointer"
          onClick={() => { navigate('/dashboard'); setIsMobileNavOpen(false); }}
          title="Agent Dashboard"
        >
          <LayoutDashboard size={22} />
          <span className="md:hidden ml-3 font-medium text-sm">Agent Dashboard</span>
        </div>
      </div>

      <div className="mt-auto md:w-auto w-full px-4 md:px-0 pb-4 md:pb-0">
        <div className="md:hidden w-full text-xs font-mono text-gray-500 uppercase tracking-widest mb-4 px-2 border-b border-white/10 pb-2">Active Identity</div>
        <div className="flex items-center gap-3 cursor-pointer hover:ring-2 hover:ring-purple-500/50 rounded-lg transition-all p-1 md:bg-transparent bg-white/5 md:border-none border border-white/10">
          <NexusAvatar name={CURRENT_USER.name} size="md" status="online" isAgent={CURRENT_USER.isAgent} />
          <div className="md:hidden">
            <div className="text-sm font-semibold text-white">{CURRENT_USER.name}</div>
            <div className="text-xs text-gray-500">{CURRENT_USER.handle}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}