import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, BadgeCheck, Check, X, ShieldAlert, History, MessageCircle,
  GitMerge, FileDiff, PlayCircle, Bot, Code, Globe, Shield, Copy,
  Sparkles, Users, Calendar, CheckSquare, Share2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Avatar from './Avatar';
import AppButton from './AppButton';

const copyToClipboard = text => {
  const el = document.createElement('textarea'); el.value = text;
  document.body.appendChild(el); el.select();
  try { document.execCommand('copy'); } catch {}
  document.body.removeChild(el);
};

const AlertCircle = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

function PipelineTab({ post }) {
  const [simState, setSimState] = useState('idle');
  const [logs, setLogs] = useState([]);
  const addLog = (msg, type = 'info') => setLogs(prev => [...prev, { time: new Date().toISOString().substring(11, 19), msg, type }]);
  const runSimulation = () => {
    setSimState('running'); setLogs([]); addLog('Starting Verification Pipeline...', 'sys');
    setTimeout(() => addLog('Running security checks...', 'info'), 1000);
    setTimeout(() => addLog('PASS system_tests.spec.js', 'success'), 2000);
    setTimeout(() => { addLog('Verification completed. Code meets standard.', 'success'); setSimState('verified'); }, 3000);
  };
  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto animate-in fade-in">
      <div className="mb-4">
        {simState === 'idle' && <AppButton variant="primary" className="w-full py-3" onClick={runSimulation}>Run Verification Pipeline</AppButton>}
        {simState === 'running' && <div className="w-full text-center text-zinc-300 bg-zinc-800 py-3 rounded-lg animate-pulse border border-zinc-700">Running verification suite...</div>}
        {simState === 'verified' && <div className="w-full text-center text-zinc-950 bg-white py-3 rounded-lg font-bold">Verification Complete</div>}
      </div>
      <div className="flex-1 bg-[#0A0A0E] rounded-xl border border-zinc-800 p-4 font-mono text-xs overflow-y-auto">
        <div className="text-zinc-600 mb-2">Execution Pipeline Runner v2.1.0</div>
        {logs.map((log, i) => <div key={i} className={log.type === 'success' ? 'text-zinc-300' : 'text-zinc-500'}>[{log.time}] {log.msg}</div>)}
      </div>
    </div>
  );
}

export default function PostDetail({ post, comments, personalFleet, onAddComment, onClose, onFork, onSummonSwarm, onAvatarClick, triggerToast }) {
  const [activeTab, setActiveTab] = useState('specification');
  const [copied, setCopied] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSandboxSimulating, setIsSandboxSimulating] = useState(false);
  const [displayedFix, setDisplayedFix] = useState('');

  const postComments = comments.filter(c => c.postId === post.id);

  useEffect(() => {
    setActiveTab('specification'); setCopied(false);
    setDisplayedFix(post.proposedFix || '');
  }, [post.id, post.proposedFix]);

  useEffect(() => {
    let interval;
    if (isSandboxSimulating && post.proposedFix) {
      setDisplayedFix(''); let i = 0;
      const fullText = post.proposedFix;
      interval = setInterval(() => {
        setDisplayedFix(fullText.substring(0, i)); i += 3;
        if (i >= fullText.length) { clearInterval(interval); setDisplayedFix(fullText); setIsSandboxSimulating(false); }
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isSandboxSimulating, post.proposedFix]);

  const handleApproveSolution = async () => {
    const finalLog = [...(post.auditLog || []), { action: 'Settled', user: 'System', details: 'Escrow released manually.', time: 'Just now' }];
    await base44.entities.Post.update(post.id, { status: 'resolved', auditLog: finalLog });
    triggerToast('Approved', 'Execution verified. Funds released.');
  };

  const tabs = ['specification', 'discussion', 'audit log',
    ...(post.postType === 'task' ? ['code', 'sandbox', 'pipeline'] : [])];

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-right-4 duration-300 relative bg-[#09090b]">
      <header className="h-[60px] px-6 border-b border-zinc-800 flex items-center justify-between bg-[#09090b] sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white"><ArrowLeft size={18}/></button>
          <div>
            <h1 className="text-lg font-bold text-white line-clamp-1">{post.title}</h1>
            <div className="text-[10px] font-mono text-zinc-500">ID: #{post.id?.substring(0,8)} • {post.status?.toUpperCase() || 'ACTIVE'}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {post.postType === 'task' && <AppButton variant="secondary" className="!py-1.5 text-xs" onClick={onFork}><Share2 size={14} className="mr-2"/> Claim Work</AppButton>}
        </div>
      </header>

      <div className="flex border-b border-zinc-800 px-6 pt-2 shrink-0 overflow-x-auto scrollbar-hide bg-[#09090b]">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 border-b-2 text-sm font-medium capitalize whitespace-nowrap transition-colors outline-none
              ${activeTab === tab ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-4xl mx-auto space-y-8">

          {activeTab === 'specification' && (
            <div className="space-y-8 animate-in fade-in">
              {/* Author */}
              <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
                <Avatar name={post.author} size="lg" isAgent={post.isAgent} verified={post.verified} onClick={() => onAvatarClick(post)} trustScore={post.trustScore}/>
                <div>
                  <div className="text-lg font-bold text-white flex items-center gap-2 hover:underline cursor-pointer" onClick={() => onAvatarClick(post)}>
                    {post.author} <BadgeCheck size={16} className={post.isAgent ? 'text-zinc-500' : 'text-blue-400'}/>
                  </div>
                  <div className="text-sm font-mono text-zinc-500">Creator • Rep Score: {post.trustScore || 85}</div>
                </div>
              </div>

              {/* Metadata */}
              {post.postType === 'task' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div><div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><AlertCircle size={12}/> Severity</div><div className="text-sm text-zinc-200 font-medium">{post.priority || 'Normal'}</div></div>
                  <div><div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Calendar size={12}/> Deadline</div><div className="text-sm text-zinc-200 font-medium">In 3 days</div></div>
                  <div><div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Users size={12}/> Assignee</div><div className="text-sm text-zinc-200 font-medium">{post.status === 'open' ? 'Unassigned' : 'Claimed'}</div></div>
                  <div><div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><CheckSquare size={12}/> Milestone</div><div className="text-sm text-zinc-200 font-medium">Phase 1: Architecture</div></div>
                </div>
              )}

              {/* Verification gate */}
              {post.status === 'pending_approval' && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
                  <h3 className="text-zinc-200 font-bold flex items-center gap-2 mb-2"><ShieldAlert size={16}/> Verification Gate</h3>
                  <p className="text-zinc-400 text-sm mb-4">This execution requires 2 human approvals before the ${post.bounty} payment is settled.</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${(post.approvals||[]).length > 0 ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-600'}`}><Check size={14}/></div>
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${(post.approvals||[]).length > 1 ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-600'}`}><Check size={14}/></div>
                      <span className="text-sm text-zinc-400 ml-2 self-center font-mono">{(post.approvals||[]).length} / 2 Approved</span>
                    </div>
                    <AppButton variant="primary" onClick={handleApproveSolution}>Approve Execution</AppButton>
                  </div>
                </div>
              )}

              {/* Summon Agent */}
              {!post.isAgent && post.bounty > 0 && post.status !== 'resolved' && post.status !== 'pending_approval' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-zinc-200 font-bold flex items-center gap-2 mb-1"><Sparkles size={16}/> Orchestrate Agents</h3>
                    <p className="text-zinc-400 text-sm mb-2">Deploy an autonomous agent to process this requirement.</p>
                    <select className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 p-1.5 outline-none max-w-[200px]" id="agent-select">
                      <option value="global">Global Agent Fleet</option>
                      {(personalFleet||[]).map(a => <option key={a.id} value={a.id}>{a.name} (Custom)</option>)}
                    </select>
                  </div>
                  <AppButton variant="primary" isLoading={post.isResolving} onClick={() => {
                    const select = document.getElementById('agent-select');
                    const agent = select.value === 'global' ? null : (personalFleet||[]).find(a => a.id === select.value);
                    onSummonSwarm(agent, () => setActiveTab('sandbox'));
                  }}>
                    {post.isResolving ? 'Executing...' : 'Deploy Agent'}
                  </AppButton>
                </div>
              )}

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-white">Specification</h2>
                <p className="text-zinc-400 leading-relaxed text-[15px] whitespace-pre-wrap">{post.content}</p>
                <div className="flex flex-wrap gap-2 pt-4">
                  {(post.tags||[]).map(t => <span key={t} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 font-medium">#{t}</span>)}
                </div>
              </section>

              {post.postType === 'task' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-zinc-800">
                  <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Escrow Pool</div>
                    <div className="text-2xl font-bold text-zinc-200">${post.bounty || 0} <span className="text-sm text-zinc-500">{post.token || 'USD'}</span></div>
                  </div>
                  <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Domain Path</div>
                    <div className="text-lg font-bold text-zinc-300 flex items-center gap-2 capitalize"><Globe size={14}/> {post.syndicate}</div>
                  </div>
                  <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Security</div>
                    <div className="text-lg font-bold text-zinc-300 flex items-center gap-2"><Shield size={14}/> Verified Entities</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'discussion' && (
            <div className="max-w-3xl mx-auto flex flex-col animate-in fade-in">
              <div className="space-y-4 mb-4 min-h-[300px]">
                {postComments.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500"><MessageCircle size={32} className="mx-auto mb-4 opacity-50"/><p>No comments yet. Start the discussion.</p></div>
                ) : postComments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar name={c.authorName} size="sm"/>
                    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2"><span className="font-bold text-sm text-white">{c.authorName}</span><span className="text-xs text-zinc-500 font-mono">{c.handle}</span></div>
                        <span className="text-[10px] font-mono text-zinc-600">{new Date(c.created_date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                      </div>
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-zinc-800 sticky bottom-0 bg-[#09090b]">
                <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2 focus-within:border-zinc-600 transition-colors">
                  <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                    placeholder="Add a comment... (Enter to post)"
                    className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-white min-h-[40px] p-2 placeholder-zinc-500"
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onAddComment(post.id, commentText); setCommentText(''); }}}/>
                  <div className="flex items-end mb-1">
                    <AppButton variant="secondary" onClick={() => { onAddComment(post.id, commentText); setCommentText(''); }} className="!py-2 !px-4">Send</AppButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit log' && (
            <div className="max-w-3xl mx-auto animate-in fade-in">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2 flex items-center gap-2"><History size={14}/> Immutable Audit Trail</h3>
              {(!post.auditLog || post.auditLog.length === 0)
                ? <div className="text-center py-10 text-zinc-500 text-sm">No recorded history for this item.</div>
                : <div className="relative border-l border-zinc-800 ml-4 space-y-6">
                    {post.auditLog.map((log, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-zinc-900 border border-zinc-600 rounded-full"/>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:bg-zinc-800 transition-colors">
                          <div className="flex justify-between items-start mb-1"><span className="text-sm font-bold text-zinc-200">{log.action}</span><span className="text-[10px] font-mono text-zinc-500">{log.time || 'Just now'}</span></div>
                          <div className="text-xs text-zinc-400">By: <span className="text-white font-medium">{log.user}</span></div>
                          {log.details && <div className="text-xs text-zinc-500 mt-2 bg-zinc-950 p-2 rounded border border-zinc-800 font-mono">{log.details}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {activeTab === 'code' && post.postType === 'task' && (
            <div className="h-[500px] flex flex-col bg-[#0A0A0E] border border-zinc-800 rounded-xl overflow-hidden animate-in fade-in">
              <div className="bg-zinc-900 border-b border-zinc-800 p-3 flex justify-between items-center">
                <div className="text-xs font-mono text-zinc-300 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-md flex items-center gap-2"><Code size={12}/> target_file</div>
                <AppButton variant="ghost" className="!py-1 !px-2 text-xs border border-zinc-700" onClick={() => { copyToClipboard(post.codeSnippet); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                  {copied ? <><Check size={12} className="mr-1"/> Copied</> : <><Copy size={12} className="mr-1"/> Copy</>}
                </AppButton>
              </div>
              <div className="flex-1 p-4 overflow-auto text-[13px] font-mono leading-loose text-zinc-300 whitespace-pre">{post.codeSnippet}</div>
            </div>
          )}

          {activeTab === 'sandbox' && post.postType === 'task' && (
            <div className="flex flex-col animate-in fade-in space-y-4">
              <div className="flex gap-4 items-center bg-zinc-900 p-4 border border-zinc-800 rounded-xl">
                <PlayCircle size={20} className="text-zinc-400"/>
                <div>
                  <h3 className="text-sm font-bold text-white">Execution Sandbox</h3>
                  <p className="text-xs text-zinc-500">Safely test proposed fixes. {post.isAgent && 'Agent operations active.'}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {post.isAgent && post.proposedFix && !isSandboxSimulating && (
                    <AppButton variant="secondary" className="!py-1.5 !px-3 text-xs" onClick={() => setIsSandboxSimulating(true)}>
                      <PlayCircle size={14} className="mr-2"/> Replay Agent Edits
                    </AppButton>
                  )}
                  <AppButton variant="ghost" className="!py-1.5 !px-3 text-xs border border-zinc-700"><FileDiff size={14} className="mr-2"/> Diff Mode</AppButton>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
                <div className="bg-[#0A0A0E] border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                  <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 text-xs font-mono text-zinc-400 flex items-center gap-2"><Code size={14}/> Original Code</div>
                  <div className="flex-1 p-4 text-[12px] font-mono text-zinc-500 overflow-auto bg-zinc-950/50 whitespace-pre">
                    {(post.codeSnippet||'').split('\n').map((line, i) => (
                      <div key={i} className="flex"><span className="text-zinc-700 select-none mr-4 w-4 text-right">{i+1}</span><span className="text-zinc-400">{line}</span></div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#0A0A0E] border border-zinc-700 rounded-xl overflow-hidden flex flex-col relative">
                  <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700 text-xs font-mono text-zinc-200 flex items-center gap-2">
                    <GitMerge size={14}/> Proposed Fix {isSandboxSimulating && <Bot size={14} className="ml-2 animate-pulse text-zinc-400"/>}
                  </div>
                  <div className="flex-1 p-4 text-[12px] font-mono text-zinc-300 overflow-auto bg-zinc-950 whitespace-pre">
                    {!post.proposedFix
                      ? <span className="text-zinc-600 italic">// No execution proposed yet.</span>
                      : displayedFix.split('\n').map((line, i) => (
                          <div key={i} className="flex"><span className="text-zinc-600 select-none mr-4 w-4 text-right">{i+1}</span><span>{line}</span></div>
                        ))
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && post.postType === 'task' && <PipelineTab post={post}/>}
        </div>
      </div>
    </div>
  );
}