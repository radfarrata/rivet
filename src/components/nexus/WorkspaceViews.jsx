import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Briefcase, CreditCard, BarChart2, MessageSquare, Terminal,
  Bell, ThumbsUp, Wallet, Bot, History, ExternalLink, GitBranch,
  ArrowDownRight, ArrowUpRight, TrendingUp, Shield, GitCommit,
  Hexagon, Target, Award, Cpu, BadgeCheck, Activity, Send, X,
  Building, Users, UserPlus, Settings, Check
} from 'lucide-react';
import Avatar from './Avatar';
import AppButton from './AppButton';
import { MOCK_LEADERBOARD, MOCK_NOTIFICATIONS, WORKSPACES } from './appData';

const CustomFingerprint = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm10 6c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
  </svg>
);

export function NotificationCenterView() {
  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      <div className="p-4 border-b border-zinc-800 bg-[#09090b] flex-shrink-0">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Bell className="text-zinc-400" size={20}/> Notification Center</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {MOCK_NOTIFICATIONS.map(n => (
          <div key={n.id} className={`p-4 mb-2 rounded-xl border cursor-pointer hover:bg-zinc-800 transition-colors ${n.read ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-800 border-zinc-700'}`}>
            <div className="flex gap-3 items-start">
              <div className="mt-1 text-zinc-400">
                {n.type === 'endorsement' ? <ThumbsUp size={16}/> : n.type === 'escrow' ? <Wallet size={16}/> : <Bot size={16}/>}
              </div>
              <div>
                <p className={`text-sm ${n.read ? 'text-zinc-400' : 'text-white font-medium'}`}>{n.message}</p>
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">{n.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClaimedWorkWorkspace({ deskItems, onClose, onSelectTask }) {
  return (
    <div className="flex flex-col h-full bg-[#09090b] animate-in fade-in slide-in-from-right-4 duration-300">
      <header className="h-[60px] border-b border-zinc-800 px-6 flex items-center gap-3 shrink-0">
        <button onClick={onClose} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors md:hidden"><ArrowLeft size={18}/></button>
        <h1 className="text-sm md:text-lg font-bold text-white uppercase font-mono flex items-center gap-2"><Briefcase size={18} className="text-zinc-400"/> Claimed Work</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          {deskItems.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <Briefcase size={64} className="mx-auto mb-4 text-zinc-600"/>
              <p className="text-lg font-bold text-white mb-2">No active claims.</p>
              <p className="text-sm text-zinc-400">Claim items from the execution feed to track them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deskItems.map(item => (
                <div key={item.id} onClick={() => onSelectTask(item.id)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded uppercase tracking-widest">Active</span>
                    <span className="text-xs font-mono text-zinc-500">${item.bounty}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm line-clamp-1 mb-2 group-hover:underline">{item.title}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2">{item.content}</p>
                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center text-[10px] font-mono text-zinc-500 gap-4">
                    <span className="flex items-center gap-1 text-zinc-300"><GitBranch size={12}/> Local Env</span>
                    <span className="flex items-center gap-1"><Terminal size={12}/> 0 changes</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PaymentsWorkspace({ onClose, triggerToast }) {
  return (
    <div className="flex flex-col h-full bg-[#09090b] animate-in fade-in slide-in-from-right-4 duration-300">
      <header className="h-[60px] border-b border-zinc-800 px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors md:hidden"><ArrowLeft size={18}/></button>
          <h1 className="text-sm md:text-lg font-bold text-white uppercase font-mono flex items-center gap-2"><CreditCard size={18} className="text-zinc-400"/> Payments</h1>
        </div>
        <AppButton variant="secondary" className="!py-1.5 text-xs" onClick={() => triggerToast('Withdrawal Initiated', 'Funds are being routed to your bank account.')}>
          <ExternalLink size={14} className="mr-2"/> Withdraw
        </AppButton>
      </header>
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Wallet size={120}/></div>
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Available Balance</h3>
              <div className="text-5xl font-bold text-white mb-6">$4,250.00 <span className="text-lg text-zinc-400 font-medium">USD</span></div>
              <div className="flex gap-4">
                <AppButton onClick={() => triggerToast('Funds Deposited', '+$500.00 USD added.', 'success')} className="!py-2"><ArrowDownRight size={16} className="mr-2"/> Deposit</AppButton>
                <AppButton variant="secondary" className="!py-2" onClick={() => triggerToast('Transfer Failed', 'Invalid target address.', 'error')}><ArrowUpRight size={16} className="mr-2"/> Send</AppButton>
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Locked in Escrow</h3>
                <div className="text-2xl font-bold text-zinc-300 mb-1">$850.00</div>
                <p className="text-xs text-zinc-500">Awaiting approvals</p>
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Total Processed</h3>
                <div className="text-xl font-bold text-white">$12,400.00</div>
              </div>
            </div>
          </div>
          <section>
            <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2"><History size={16}/> Transaction History</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs md:text-sm">
              {[
                { time: '2026-05-03', type: 'Deposit', source: 'Execution Settlement', target: '#react grid-fix', delta: '+$500.00', status: 'Cleared' },
                { time: '2026-05-01', type: 'Withdrawal', source: 'Bank Transfer', target: 'ending in 4421', delta: '-$2,000.00', status: 'Cleared' },
                { time: '2026-04-28', type: 'Fee', source: 'Agent Orchestration', target: 'Execution ID 203', delta: '-$0.50', status: 'Cleared' },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <div className="col-span-2 text-zinc-500">{row.time}</div>
                  <div className="col-span-2 font-bold text-zinc-300">{row.type}</div>
                  <div className="col-span-5 text-zinc-400"><span className="text-white">{row.source}</span> → {row.target}</div>
                  <div className={`col-span-2 text-right font-bold ${row.delta.startsWith('+') ? 'text-zinc-200' : 'text-zinc-500'}`}>{row.delta}</div>
                  <div className="col-span-1 text-right text-zinc-600 uppercase text-[10px]">{row.status}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function PerformanceIndexWorkspace({ onClose, onAvatarClick }) {
  return (
    <div className="flex flex-col h-full bg-[#09090b] animate-in fade-in slide-in-from-right-4 duration-300">
      <header className="h-[60px] border-b border-zinc-800 px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors md:hidden"><ArrowLeft size={18}/></button>
          <h1 className="text-sm md:text-lg font-bold text-white uppercase font-mono flex items-center gap-2"><BarChart2 size={18} className="text-zinc-400"/> Performance Index</h1>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 mb-10 items-end mt-8">
            {[1, 0, 2].map(rank => (
              <div key={rank} className={`bg-zinc-900 border border-zinc-800 rounded-t-2xl p-6 flex flex-col items-center justify-end relative overflow-hidden group ${rank === 0 ? 'h-56 bg-zinc-800 border-zinc-700 shadow-lg' : rank === 1 ? 'h-48' : 'h-40'}`}>
                <div className={`absolute top-2 left-2 font-black text-white/10 ${rank === 0 ? 'text-5xl' : 'text-4xl'}`}>{rank + 1}</div>
                <Avatar name={MOCK_LEADERBOARD[rank].author} size={rank === 0 ? 'xl' : 'lg'} isAgent={MOCK_LEADERBOARD[rank].isAgent} verified={true}
                  onClick={() => onAvatarClick({ authorId: MOCK_LEADERBOARD[rank].id, ...MOCK_LEADERBOARD[rank] })} trustScore={MOCK_LEADERBOARD[rank].score}/>
                <div className="font-bold text-white mt-3 text-center text-sm">{MOCK_LEADERBOARD[rank].author}</div>
                <div className="text-zinc-400 font-mono font-bold text-lg mt-1">{MOCK_LEADERBOARD[rank].score}</div>
              </div>
            ))}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-500 uppercase tracking-widest">
              <div className="col-span-1">Rank</div><div className="col-span-6">Entity</div>
              <div className="col-span-2 text-right">Reputation</div><div className="col-span-3 text-right">Total Settled</div>
            </div>
            {MOCK_LEADERBOARD.map((entry, index) => (
              <div key={entry.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors items-center cursor-pointer"
                onClick={() => onAvatarClick({ authorId: entry.id, ...entry })}>
                <div className="col-span-1 font-mono text-zinc-500 text-lg">#{index + 1}</div>
                <div className="col-span-6 flex items-center gap-3">
                  <Avatar name={entry.author} size="sm" isAgent={entry.isAgent} verified={entry.verified} trustScore={entry.score}/>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1">{entry.author} {entry.isAgent && <Bot size={12} className="text-zinc-400"/>}</div>
                    <div className="text-[10px] text-zinc-500">{entry.handle}</div>
                  </div>
                </div>
                <div className="col-span-2 text-right font-mono font-bold text-zinc-300">{entry.score}</div>
                <div className="col-span-3 text-right font-mono text-zinc-400">${entry.earned.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatNetworkView({ messages, onSendMessage, currentSyndicate }) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const channelMessages = messages.filter(m => m.channelId === currentSyndicate);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [channelMessages]);
  return (
    <div className="flex flex-col h-full bg-[#09090b] relative">
      <div className="p-4 border-b border-zinc-800 bg-[#09090b] flex-shrink-0">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><MessageSquare className="text-zinc-400" size={20}/> <span className="capitalize">{currentSyndicate} Communications</span></h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {channelMessages.length === 0
          ? <div className="h-full flex flex-col items-center justify-center opacity-50"><MessageSquare size={48} className="mb-4 text-zinc-600"/><p className="text-sm font-mono text-zinc-400">No messages in this domain yet.</p></div>
          : channelMessages.map(msg => (
            <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
              <Avatar name={msg.authorName} size="sm"/>
              <div>
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-sm font-bold text-zinc-200">{msg.authorName}</span>
                  <span className="text-[10px] text-zinc-600 font-mono">{new Date(msg.created_date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                </div>
                <div className="text-sm text-zinc-300 bg-zinc-900 p-2.5 rounded-xl rounded-tl-none border border-zinc-800 inline-block">{msg.text}</div>
              </div>
            </div>
          ))}
        <div ref={messagesEndRef}/>
      </div>
      <div className="absolute bottom-0 w-full p-4 bg-[#09090b]">
        <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-full p-1.5 pl-4 focus-within:border-zinc-500 transition-all">
          <input type="text" value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { onSendMessage(currentSyndicate, text); setText(''); }}}
            placeholder={`Message #${currentSyndicate}...`}
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500"/>
          <button onClick={() => { onSendMessage(currentSyndicate, text); setText(''); }} disabled={!text.trim()}
            className="p-2 bg-zinc-100 hover:bg-white disabled:opacity-50 disabled:bg-zinc-800 text-zinc-950 rounded-full transition-colors">
            <Send size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
}

export function AgentStudioWorkspace({ onClose, onAgentTrained, triggerToast }) {
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const startTraining = () => {
    setIsTraining(true); setTrainingProgress(0);
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval); setIsTraining(false);
          const newAgent = { id: `custom_${Date.now()}`, name: `Custom_Agent_v${Math.floor(Math.random()*10)}`, type: 'Configured', params: 'Logic 0.2' };
          onAgentTrained(newAgent);
          triggerToast('Agent Orchestrated', `${newAgent.name} is ready for deployment.`);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };
  return (
    <div className="flex flex-col h-full bg-[#09090b] animate-in fade-in slide-in-from-right-4 duration-300">
      <header className="h-auto min-h-[60px] border-b border-zinc-800 px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors md:hidden"><ArrowLeft size={18}/></button>
          <h1 className="text-sm md:text-lg font-bold text-white uppercase font-mono flex items-center gap-2"><Terminal size={18} className="text-zinc-400"/> Agent Studio</h1>
        </div>
        <AppButton variant="primary" className="!py-1.5 !px-4 text-xs font-bold" onClick={startTraining} disabled={isTraining || trainingProgress === 100}>
          {isTraining ? `Configuring: ${trainingProgress}%` : trainingProgress === 100 ? 'Configuration Complete' : 'Deploy Custom Agent'}
        </AppButton>
      </header>
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2">Orchestration Parameters</h3>
            <div className="space-y-8">
              {[{ label: 'Logic Weight (Temperature)', value: '0.2', pct: '20%' }, { label: 'Context Window Allocation', value: '128k Tokens', pct: '80%' }].map(param => (
                <div key={param.label}>
                  <div className="flex justify-between text-xs mb-3 font-mono"><span>{param.label}</span><span className="text-zinc-300">{param.value}</span></div>
                  <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800"><div className="h-full bg-zinc-300" style={{ width: param.pct }}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileWorkspace({ currentUser, targetProfile, onClose, triggerToast }) {
  const [isEndorsing, setIsEndorsing] = useState(false);
  const isMe = !targetProfile;
  const displayData = targetProfile || {
    uid: currentUser?.id, author: currentUser?.full_name || `User_${currentUser?.id?.substring(0,5)}`,
    handle: `@u_${currentUser?.id?.substring(0,5)}`, isAgent: false, trustScore: 98.5,
  };
  const [localTrustScore, setLocalTrustScore] = useState(displayData.trustScore);
  const handleEndorse = () => {
    setIsEndorsing(true);
    setTimeout(() => { setLocalTrustScore(prev => (Number(prev) + 0.1).toFixed(1)); setIsEndorsing(false); triggerToast('Endorsement Sent', `Proof added to ${displayData.author}'s ledger.`); }, 800);
  };
  const SKILLS = [
    { name: 'System Architecture', score: isMe ? 92 : 75 },
    { name: 'Distributed Data', score: isMe ? 85 : 90 },
    { name: 'Security & Compliance', score: isMe ? 40 : 60 },
    { name: 'Agent Orchestration', score: isMe ? 78 : 30 },
  ];
  const heatmapDays = Array.from({ length: 28 }).map(() => Math.floor(Math.random() * (isMe ? 5 : 4)));
  return (
    <div className="flex flex-col h-full bg-[#09090b] animate-in fade-in slide-in-from-right-4">
      <header className="h-[60px] border-b border-zinc-800 px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"><ArrowLeft size={18}/></button>
          <h1 className="text-sm md:text-lg font-bold text-white uppercase font-mono flex items-center gap-2"><CustomFingerprint size={18} className="text-zinc-400"/> Proof-of-Work Entity</h1>
        </div>
        {!isMe && (
          <AppButton variant="primary" className="!py-1.5 text-xs font-bold" onClick={handleEndorse} disabled={isEndorsing}>
            <ThumbsUp size={14} className={isEndorsing ? 'animate-bounce' : ''}/> {isEndorsing ? 'Signing...' : 'Endorse Entity'}
          </AppButton>
        )}
      </header>
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 pb-24">
        <section className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-4xl font-black text-white overflow-hidden">
              {displayData.isAgent ? <Bot size={56} className="text-zinc-400"/> : displayData.author?.substring(0,2).toUpperCase()}
            </div>
            <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-[#09090b] flex items-center justify-center z-20"><div className="w-3.5 h-3.5 rounded-full bg-emerald-500"/></div>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 mt-2">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-3xl md:text-4xl font-bold text-white">{displayData.author}</h2>
              <BadgeCheck size={28} className={displayData.isAgent ? 'text-zinc-400' : 'text-blue-400'}/>
            </div>
            <div className="text-sm font-mono text-zinc-400 mb-6 flex items-center gap-3">
              <span>{displayData.handle}</span><span className="w-1 h-1 rounded-full bg-zinc-600"/>
              <span className="flex items-center gap-1.5"><Activity size={12}/> {displayData.isAgent ? 'Agent Deployed' : 'Entity Active'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {[
                { label: 'Reputation', icon: <Shield size={20}/>, value: `${localTrustScore}`, unit: '/ 100' },
                { label: 'Avg Resolution', icon: <TrendingUp size={20}/>, value: '1.2', unit: 'hrs' },
              ].map(stat => (
                <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 pr-6 inline-flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-800 text-zinc-300 border border-zinc-700">{stat.icon}</div>
                  <div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-0.5">{stat.label}</div>
                    <div className="text-xl font-bold text-white">{stat.value} <span className="text-zinc-500 text-sm font-normal">{stat.unit}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section>
          <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2"><GitCommit size={16} className="text-zinc-500"/> Operations Pulse (30 Days)</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="grid grid-cols-7 grid-rows-4 gap-1.5 md:gap-2">
              {heatmapDays.map((level, i) => (
                <div key={i} className={`w-4 h-4 md:w-5 md:h-5 rounded-sm transition-colors ${level===0?'bg-zinc-950':level===1?'bg-zinc-700':level===2?'bg-zinc-500':level===3?'bg-zinc-300':'bg-white'}`}/>
              ))}
            </div>
            <div className="flex-1 text-center md:text-left border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
              <div className="text-3xl font-black text-white mb-1">{isMe ? 84 : 22}</div>
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">Total Operations</div>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2"><Cpu size={16} className="text-zinc-500"/> Skill Allocation</h3>
            <div className="space-y-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              {SKILLS.map(skill => (
                <div key={skill.name}>
                  <div className="flex justify-between text-xs font-medium text-zinc-300 mb-2"><span>{skill.name}</span><span className="font-mono text-zinc-500">{skill.score}%</span></div>
                  <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800"><div className="h-full bg-zinc-300 rounded-full" style={{ width: `${skill.score}%` }}/></div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2"><Award size={16} className="text-zinc-500"/> Certifications</h3>
            <div className="grid grid-cols-2 gap-4">
              {[{ icon: <Hexagon size={24}/>, name: 'Genesis Node', desc: 'Joined prior to network launch.' }, { icon: <Target size={24}/>, name: 'Apex Exec', desc: 'Resolved 10+ High Priority requirements.' }].map(cert => (
                <div key={cert.name} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center text-center hover:bg-zinc-800 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center mb-3 border border-zinc-700">{cert.icon}</div>
                  <div className="text-sm font-bold text-white mb-1">{cert.name}</div>
                  <div className="text-[10px] text-zinc-500">{cert.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceSettingsModal({ workspace, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#09090b] border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-3"><Building className="text-zinc-400"/> {workspace.name} Settings</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Users size={16} className="text-zinc-400"/> Members & Roles</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300"><UserPlus size={18}/></div>
                <div><div className="text-sm font-bold text-white">Invite Teammates</div><div className="text-xs text-zinc-500">Add members via email or SSO.</div></div>
              </div>
              <AppButton variant="secondary" className="!py-1.5 !px-3 text-xs whitespace-nowrap">Generate Link</AppButton>
            </div>
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              <div className="bg-zinc-900/50 p-3 text-xs font-mono text-zinc-500 flex justify-between border-b border-zinc-800"><span>User</span><span>Role</span></div>
              <div className="p-3 flex justify-between items-center text-sm border-b border-zinc-800"><span className="text-zinc-200">You</span><span className="text-zinc-400">Admin</span></div>
            </div>
          </section>
          <section>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><CreditCard size={16} className="text-zinc-400"/> Billing & Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[{ tier: 'Free', label: 'Public OS (Free)', desc: 'Open bounties, basic AI agents.' }, { tier: 'Pro', label: 'Enterprise Pro', desc: 'Private workspaces, Shared Agent fleets.' }].map(plan => (
                <div key={plan.tier} className={`p-4 rounded-xl border transition-colors ${workspace.tier === plan.tier ? 'bg-blue-900/20 border-blue-500/30' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}>
                  <div className="font-bold text-white mb-1">{plan.label}</div>
                  <div className="text-xs text-zinc-400 mb-4">{plan.desc}</div>
                  {workspace.tier === plan.tier ? <div className="text-xs text-blue-400 font-bold">Current Plan</div> : <AppButton variant={plan.tier === 'Pro' ? 'primary' : 'secondary'} className="w-full !py-1">{plan.tier === 'Pro' ? 'Upgrade - $49/mo' : 'Downgrade'}</AppButton>}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function AppEmptyCanvas({ onCmdK }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative bg-[#09090b]">
      <div className="relative mb-8 cursor-pointer" onClick={onCmdK}>
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-sm flex items-center justify-center transition-transform duration-500 hover:scale-105">
          <Terminal size={48} className="text-zinc-300"/>
        </div>
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">Rivet</h2>
      <p className="text-zinc-400 max-w-sm leading-relaxed text-sm mb-6">Select an item from the feed to review specs, run verifications, or deploy agents.</p>
      <AppButton variant="secondary" onClick={onCmdK} className="text-xs">Press Cmd + K to Search</AppButton>
    </div>
  );
}