import React from 'react';
import { Search, Layers, Share2 } from 'lucide-react';
import { SYNDICATES, SYNDICATE_THEMES } from './data';
import Composer from './Composer';
import PostCard from './PostCard';
import TopologyView from './TopologyView';

export default function StreamPanel({
  activeSyndicate,
  posts,
  activePost,
  setActivePost,
  composerText,
  setComposerText,
  onExecute,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
}) {
  const currentSyndicate = SYNDICATES.find(s => s.id === activeSyndicate);
  const theme = SYNDICATE_THEMES[activeSyndicate] || SYNDICATE_THEMES.global;

  return (
    <aside
      className={`
        ${activePost ? 'hidden lg:flex' : 'flex'} 
        w-full md:w-[380px] lg:w-[450px] h-[calc(100vh-53px)] md:h-screen 
        border-r border-white/5 backdrop-blur-xl flex-col z-20 flex-shrink-0 relative shadow-2xl transition-all duration-500
      `}
      style={{ background: theme.panelBg || 'rgba(7,7,10,0.92)' }}
    >
      {/* Header & View Toggle */}
      <div
        className="p-4 md:p-5 border-b border-white/5 flex-shrink-0 transition-colors duration-500"
        style={{ background: theme.headerBg }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2 tracking-tight">
            {currentSyndicate?.icon}
            <span className="truncate">{currentSyndicate?.name}</span>
          </h2>
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 flex-shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Layers size={14} />
            </button>
            <button
              onClick={() => setViewMode('topology')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'topology' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Query semantic graph..."
            className={`w-full bg-white/[0.02] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:bg-white/[0.05] transition-all ${theme.searchFocus}`}
          />
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {viewMode === 'list' ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <Composer composerText={composerText} setComposerText={setComposerText} onExecute={onExecute} />

            {posts.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center p-8 gap-3 mt-4">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-gray-400 font-semibold text-sm">No nodes found</div>
                <div className="text-gray-600 text-xs font-mono max-w-[220px] leading-relaxed">
                  {searchQuery
                    ? `No results for "${searchQuery}". Try a different query.`
                    : 'This syndicate has no active nodes yet. Be the first to deploy one.'}
                </div>
              </div>
            )}

            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                isActive={activePost?.id === post.id}
                onClick={() => setActivePost(post)}
                theme={theme}
              />
            ))}
          </div>
        ) : (
          <TopologyView posts={posts} activePost={activePost} setActivePost={setActivePost} />
        )}
      </div>
    </aside>
  );
}