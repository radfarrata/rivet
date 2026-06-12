import React from 'react';
import { Search, CheckCircle2, MessageCircle, Activity, ThumbsUp, Bot, Code } from 'lucide-react';
import Avatar from './Avatar';
import AppButton from './AppButton';
import { SYNDICATES } from './appData';

export default function FeedPanel({
  activeWorkspace, activeSyndicate, activePost, activeView,
  activeFeedTab, setActiveFeedTab,
  setIsCommandOpen, composerText, setComposerText, postComposerType, setPostComposerType,
  handlePost, loadingDb, rankedPosts, setActivePost, setActiveView, setIsViewingProfile,
  openUserProfile, handleUpvote, currentUser,
}) {
  const isMainCanvasActive = activePost || ['studio', 'payments', 'performance', 'claimed'].includes(activeView);

  return (
    <aside className={`
      ${isMainCanvasActive ? 'hidden lg:flex' : 'flex'}
      w-full md:w-[380px] lg:w-[420px] h-full mt-[53px] md:mt-0
      border-r border-zinc-800 bg-[#09090b] flex-col z-20 flex-shrink-0 transition-all duration-300
    `}>
      <div className="p-4 border-b border-zinc-800 flex flex-col gap-4 bg-[#09090b]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">{activeWorkspace?.name}</div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-none">
              {SYNDICATES.find(s => s.id === activeSyndicate)?.name || 'Network'} Feed
            </h2>
          </div>
        </div>
        <div className="flex gap-4 border-b border-zinc-800 pb-2 text-xs font-bold uppercase tracking-widest overflow-x-auto scrollbar-hide">
          {['foryou', 'trending', 'following'].map(tab => (
            <button key={tab} onClick={() => setActiveFeedTab(tab)}
              className={`pb-2 whitespace-nowrap transition-colors capitalize ${activeFeedTab === tab ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {tab === 'foryou' ? 'For You' : tab}
            </button>
          ))}
        </div>
        <div className="relative group cursor-pointer" onClick={() => setIsCommandOpen(true)}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
          <input type="text" placeholder="Search (Cmd + K)..." readOnly
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm outline-none cursor-pointer focus:border-zinc-700 transition-all placeholder:text-zinc-600"/>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono">⌘K</div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto pb-10">
          {/* Composer */}
          <div className="p-3 border-b border-zinc-800 bg-[#09090b]">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl focus-within:border-zinc-700 transition-all overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                <select value={postComposerType} onChange={e => setPostComposerType(e.target.value)}
                  className="bg-transparent text-xs font-bold text-zinc-400 uppercase tracking-widest outline-none cursor-pointer hover:text-white transition-colors">
                  <option value="task" className="text-black">📝 Post Request</option>
                  <option value="discussion" className="text-black">💬 Broadcast</option>
                </select>
              </div>
              <div className="flex items-start gap-3 p-4">
                <Avatar name={currentUser?.full_name || 'Me'} size="sm"/>
                <textarea value={composerText} onChange={e => setComposerText(e.target.value)}
                  onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handlePost(); } }}
                  placeholder="Create new execution request... (⌘+Enter)"
                  className="w-full bg-transparent border-none outline-none resize-none text-[13px] text-zinc-200 placeholder-zinc-600 min-h-[60px] leading-relaxed pt-1"/>
              </div>
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-t border-zinc-800">
                <div className="flex items-center gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  {postComposerType === 'task' && (
                    <button onClick={() => setComposerText(prev => prev + '\n[LINKED_FILE: src/main.js]')}
                      className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 hover:text-zinc-200 transition-colors uppercase tracking-wider whitespace-nowrap">
                      <Code size={14}/> Attach Spec
                    </button>
                  )}
                  <button onClick={() => setComposerText(prev => prev + '\n[ASSIGNED: @ai_agent]')}
                    className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 hover:text-zinc-200 transition-colors uppercase tracking-wider whitespace-nowrap">
                    <Bot size={14}/> Route to Agent
                  </button>
                </div>
                <AppButton variant="primary" className="!py-1.5 !px-5 text-xs font-bold shrink-0 ml-2" onClick={handlePost} disabled={!composerText.trim()}>Submit</AppButton>
              </div>
            </div>
          </div>

          {loadingDb ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Activity className="animate-spin text-zinc-500"/>
            </div>
          ) : rankedPosts.map(post => (
            <div key={post.id}
              onClick={() => { setActivePost(post); setActiveView('network'); setIsViewingProfile(false); }}
              className={`group p-4 border-b transition-all cursor-pointer relative overflow-hidden ${activePost?.id === post.id ? 'bg-zinc-900 border-zinc-800' : 'bg-transparent border-zinc-800 hover:bg-zinc-900/50'}`}>
              {activePost?.id === post.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-500"/>}
              {post.isResolving && (
                <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                  <Activity className="w-6 h-6 text-zinc-400 animate-spin mb-2"/>
                  <span className="text-xs font-mono text-zinc-300 tracking-wider">ORCHESTRATING...</span>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3 text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                {post.postType === 'task' ? <CheckCircle2 size={12}/> : <MessageCircle size={12}/>}
                <span>{post.postType === 'task' ? 'Execution Request' : post.postType}</span>
                <span>•</span>
                <span>{post.time || 'Just now'}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Avatar name={post.author} size="md" isAgent={post.isAgent} verified={post.verified} trustScore={post.trustScore} onClick={() => openUserProfile(post)}/>
                <div>
                  <div className="text-sm font-bold text-white hover:underline cursor-pointer" onClick={e => { e.stopPropagation(); openUserProfile(post); }}>{post.author}</div>
                  <div className="text-[10px] text-zinc-500">{post.handle}</div>
                </div>
              </div>
              <h4 className="text-sm font-bold text-zinc-200 mb-1 line-clamp-1">{post.title}</h4>
              <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4">{post.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-[11px] font-mono text-zinc-500">
                  <span onClick={e => { e.stopPropagation(); handleUpvote(post); }} className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                    <ThumbsUp size={12} className={post.upvotes > 100 ? 'text-zinc-300' : ''}/> {post.upvotes || 0}
                  </span>
                  <span className="flex items-center gap-1.5"><MessageCircle size={12}/> {post.replies || 0}</span>
                </div>
                {post.postType === 'task' && post.bounty > 0 && (
                  <div className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${post.status === 'resolved' ? 'text-zinc-500 bg-zinc-900 border border-zinc-800' : post.status === 'pending_approval' ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-zinc-100 text-zinc-900'}`}>
                    ${post.bounty} {post.status === 'resolved' ? 'Settled' : 'Escrow'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}