import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Network, GitBranch, Check, X as XIcon,
  FileText, Code, Cpu as CpuIcon, Copy, Maximize2, Command,
  Users, Bot, BookOpen, Sparkles, Lock, CheckCircle2, Target, ScrollText
} from 'lucide-react';
import NexusAvatar from './NexusAvatar';
import GlassButton from './GlassButton';
import OracleEngine from './OracleEngine';
import AgentAuditLog from './AgentAuditLog';

function TabButton({ children, active, onClick, icon, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 md:px-6 py-3 border-b-2 text-xs md:text-sm font-medium transition-colors outline-none whitespace-nowrap
        ${active
          ? `border-cyan-500 text-cyan-300 ${className}`
          : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-white/20'
        }
      `}
    >
      {icon} {children}
    </button>
  );
}

const copyToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try { document.execCommand('copy'); } catch (err) { /* noop */ }
  document.body.removeChild(textArea);
};

export default function CanvasWorkspace({ post, onClose, onFork, onSummonSwarm }) {
  const [activeTab, setActiveTab] = useState('context');
  const [isForked, setIsForked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveTab('context');
    setIsForked(false);
    setIsFullscreen(false);
    setCopied(false);
  }, [post.id]);

  const handleForkClick = () => {
    onFork(post.id);
    setIsForked(true);
  };

  const handleCopyCode = () => {
    copyToClipboard(post.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col h-full animate-in fade-in slide-in-from-right-4 md:slide-in-from-right-0 duration-300 bg-[#020203] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <header className="h-auto min-h-[72px] py-4 md:py-0 border-b border-white/5 bg-[#050507]/90 backdrop-blur-md px-4 md:px-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 flex-shrink-0 relative">
        <div className="flex items-start md:items-center gap-3 md:gap-4 pr-10 md:pr-0">
          <button onClick={onClose} className="md:hidden mt-1 p-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400">
            <ArrowLeft size={18} />
          </button>
          <div className={`p-2 rounded-lg border flex-shrink-0 ${post.isAgent ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}>
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-semibold tracking-tight text-white line-clamp-1 md:line-clamp-none">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs font-mono text-gray-500 mt-1">
              <span>Hash: 0x{post.id.toString(16).padStart(8, '0')}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600 hidden md:block" />
              <span className={post.type === 'Verified Execution' ? 'text-emerald-400' : 'text-gray-400'}>
                Status: {post.type === 'Verified Execution' ? 'Resolved & Verified' : 'Verifiable'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 justify-start md:justify-end">
          <GlassButton
            variant={isForked ? 'secondary' : (post.isAgent ? 'agent' : 'primary')}
            className={`!py-1.5 flex-1 md:flex-none ${isForked ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : ''}`}
            onClick={handleForkClick}
            disabled={isForked || post.isResolving}
          >
            {isForked ? <Check size={14} className="mr-2" /> : <GitBranch size={14} className="mr-2" />}
            {isForked ? 'Forked' : 'Fork'}
          </GlassButton>
          {!isFullscreen && (
            <button onClick={onClose} className="hidden md:block p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
              <XIcon size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-black/40 px-2 md:px-6 pt-2 flex-shrink-0 overflow-x-auto scrollbar-hide">
        <TabButton active={activeTab === 'context'} onClick={() => setActiveTab('context')} icon={<FileText size={14} />}>Context</TabButton>
        <TabButton active={activeTab === 'code'} onClick={() => setActiveTab('code')} icon={<Code size={14} />}>Source</TabButton>
        <TabButton active={activeTab === 'oracle'} onClick={() => setActiveTab('oracle')} icon={<CpuIcon size={14} />} className="text-cyan-400 border-cyan-500/30">DePIN Engine</TabButton>
        <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<ScrollText size={14} />}>Audit Log</TabButton>
      </div>

      {/* Content — context/code tabs scroll freely; oracle/audit manage their own internal scroll */}
      {(activeTab === 'context' || activeTab === 'code') && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'context' && <ContextTab post={post} onSummonSwarm={onSummonSwarm} />}
          {activeTab === 'code' && <CodeTab post={post} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} copied={copied} onCopy={handleCopyCode} />}
        </div>
      )}
      {activeTab === 'oracle' && (
        <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col min-h-0">
          <OracleEngine post={post} />
        </div>
      )}
      {activeTab === 'audit' && (
        <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col min-h-0">
          <AgentAuditLog post={post} />
        </div>
      )}
    </div>
  );
}

function ContextTab({ post, onSummonSwarm }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 animate-in fade-in">
      {/* Summon Swarm CTA */}
      {!post.isAgent && post.bounty > 0 && post.type !== 'Verified Execution' && (
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/10 border border-cyan-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(6,182,212,0.1)] relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
            <Bot size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-cyan-300 font-bold flex items-center gap-2 mb-1"><Sparkles size={16} /> Summon Autonomous Swarm</h3>
            <p className="text-cyan-100/60 text-sm">Delegate this open bounty to an AI agent network for instant architectural resolution.</p>
          </div>
          <GlassButton variant="agent" className="relative z-10 w-full md:w-auto" isLoading={post.isResolving} onClick={() => onSummonSwarm(post.id)}>
            Deploy Swarm Agent
          </GlassButton>
        </div>
      )}

      <div className="flex items-center gap-4 p-4 bg-white/[0.01] border border-white/5 rounded-xl">
        <NexusAvatar name={post.author} size="lg" isAgent={post.isAgent} />
        <div>
          <div className="text-gray-400 text-sm mb-1 flex items-center gap-2">
            {post.isAgent ? <><Bot size={14} /> Autonomous Agent</> : <><Users size={14} /> Human Architect</>}
          </div>
          <div className="text-lg md:text-xl font-medium text-white">
            {post.author} <span className={`text-xs md:text-sm font-mono ml-2 ${post.isAgent ? 'text-cyan-400' : 'text-purple-400'}`}>{post.handle}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs md:text-sm font-mono text-gray-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2 flex items-center gap-2"><BookOpen size={16} /> Architectural Intent</h3>
        <p className="text-gray-300 leading-relaxed text-sm md:text-[16px] whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.bounty > 0 && (
        <BountyCard post={post} />
      )}
    </div>
  );
}

function BountyCard({ post }) {
  const isVerified = post.type === 'Verified Execution';
  const isBounty = post.type === 'System Bounty';

  const gradientClass = isVerified ? 'from-emerald-900/20 to-black border-emerald-500/20'
    : isBounty ? 'from-red-900/20 to-black border-red-500/30'
    : 'from-purple-900/20 to-black border-purple-500/20';

  const titleColor = isVerified ? 'text-emerald-500' : isBounty ? 'text-red-500' : 'text-purple-400';
  const amountColor = isBounty ? 'text-red-400 text-xl md:text-2xl' : isVerified ? 'text-gray-600 text-xl' : 'text-purple-400 text-xl md:text-2xl';

  return (
    <div className={`p-6 bg-gradient-to-br ${gradientClass} border rounded-xl relative overflow-hidden shadow-2xl mt-8`}>
      <div className="absolute -right-10 -top-10 opacity-5">
        <Target size={200} />
      </div>
      <h3 className={`text-xs md:text-sm font-mono ${titleColor} uppercase tracking-widest mb-2 relative z-10 flex items-center gap-2`}>
        {isVerified ? <CheckCircle2 size={14} /> : <Lock size={14} />}
        {isVerified ? 'Bounty Claimed' : 'Smart Contract Escrow'}
      </h3>
      <div className={`text-4xl md:text-5xl font-bold ${isVerified ? 'text-gray-500 line-through' : 'text-white'} relative z-10`}>
        {post.bounty.toLocaleString()} <span className={amountColor}>{post.token}</span>
      </div>
      <p className="text-gray-400 text-xs md:text-sm mt-3 relative z-10 border-t border-white/10 pt-3">
        {isVerified ? 'Funds have been disbursed via oracle execution.' : 'Funds will be released autonomously upon Oracle mathematical verification.'}
      </p>
    </div>
  );
}

function CodeTab({ post, isFullscreen, setIsFullscreen, copied, onCopy }) {
  return (
    <div className="min-h-[400px] h-full flex flex-col bg-[#0A0A0E] border border-white/10 rounded-xl overflow-hidden animate-in fade-in shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      <div className="bg-black/60 border-b border-white/5 p-2 md:p-3 flex justify-between items-center overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 text-xs font-mono text-gray-400">
          <span className="text-cyan-300 bg-cyan-900/20 border border-cyan-500/20 px-3 py-1.5 rounded-md flex items-center gap-2"><Code size={12} /> index.logic</span>
          <span className="px-3 py-1.5 hover:text-white cursor-pointer transition-colors hidden md:block">dependencies.json</span>
        </div>
        <div className="flex gap-2">
          <GlassButton variant="ghost" className="!py-1 !px-2 text-xs" onClick={onCopy}>
            {copied ? <><Check size={12} className="mr-1 text-emerald-400" /> Copied</> : <><Copy size={12} className="mr-1" /> Copy</>}
          </GlassButton>
          <GlassButton variant="ghost" className="!py-1 !px-2 text-xs hidden md:flex" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <><Command size={12} className="mr-1" /> Exit</> : <><Maximize2 size={12} className="mr-1" /> Fullscreen</>}
          </GlassButton>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto text-[13px] md:text-[14px] font-mono leading-loose text-gray-300">
        <pre className="m-0">
          <code>
            {post.codeSnippet.split('\n').map((line, i) => {
              const isComment = line.trim().startsWith('//') || line.trim().startsWith('#');
              const isKeyword = /(function|def|class|contract|return|const|let|var|new|map)\b/.test(line);

              return (
                <div key={i} className="flex hover:bg-white/[0.02] px-2 rounded group">
                  <span className="w-6 md:w-10 flex-shrink-0 text-gray-600 text-right pr-2 md:pr-4 select-none border-r border-white/5 mr-2 md:mr-4 group-hover:text-gray-400 transition-colors">{i + 1}</span>
                  <span className={`whitespace-pre ${isComment ? 'text-emerald-500/70 italic' : isKeyword ? 'text-cyan-300' : 'text-gray-300'}`}>
                    {line}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}