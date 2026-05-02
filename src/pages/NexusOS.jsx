import React, { useState } from 'react';
import SyndicateRail, { MobileHeader } from '../components/nexus/SyndicateRail';
import StreamPanel from '../components/nexus/StreamPanel';
import CanvasWorkspace from '../components/nexus/CanvasWorkspace';
import EmptyCanvasState from '../components/nexus/EmptyCanvasState';
import { CURRENT_USER, INITIAL_POSTS } from '../components/nexus/data';

export default function NexusOS() {
  const [activeSyndicate, setActiveSyndicate] = useState('global');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [activePost, setActivePost] = useState(null);
  const [composerText, setComposerText] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const filteredPosts = posts.filter(p => {
    const matchesSyndicate = activeSyndicate === 'global' ? true : p.syndicate === activeSyndicate;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSyndicate && matchesSearch;
  });

  const handleExecute = () => {
    if (!composerText.trim()) return;

    const randomX = Math.floor(Math.random() * 60) + 20;
    const randomY = Math.floor(Math.random() * 60) + 20;

    const newPost = {
      id: Date.now(),
      title: 'Automated Agent Protocol Initiative',
      author: CURRENT_USER.name,
      handle: CURRENT_USER.handle,
      time: 'Just now',
      syndicate: activeSyndicate === 'global' ? 'ai' : activeSyndicate,
      type: 'Execution Request',
      content: composerText,
      metrics: { signal: 100, forks: 0, comments: 0 },
      bounty: 1000,
      token: 'SYS',
      tags: ['New', 'Unverified'],
      codeSnippet: "// Awaiting repository initialization...\n// Connect git remote to begin tracking.\nfunction init() {\n  console.log('Deploying initial state...');\n}",
      isAgent: CURRENT_USER.isAgent,
      staked: false,
      pos: { x: randomX, y: randomY },
    };

    setPosts([newPost, ...posts]);
    setComposerText('');
  };

  const handleFork = (postId) => {
    setPosts(prevPosts => prevPosts.map(p =>
      p.id === postId ? { ...p, metrics: { ...p.metrics, forks: p.metrics.forks + 1 } } : p
    ));
    if (activePost && activePost.id === postId) {
      setActivePost(prev => ({ ...prev, metrics: { ...prev.metrics, forks: prev.metrics.forks + 1 } }));
    }
  };

  const handleSummonSwarm = (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isResolving: true } : p));
    if (activePost?.id === postId) {
      setActivePost(prev => ({ ...prev, isResolving: true }));
    }

    setTimeout(() => {
      const targetPost = posts.find(p => p.id === postId);
      const updatedPost = {
        type: 'Verified Execution',
        title: `[RESOLVED] ${targetPost.title}`,
        author: 'Swarm_Agent_Sigma',
        handle: '@swarm.sigma',
        isAgent: true,
        bounty: 0,
        content: `Resolved via autonomous swarm execution. O(N) pathfinding bottleneck identified and rewritten to O(log N) utilizing decentralized state maps. Escrow bounty successfully claimed.`,
        codeSnippet: "// Swarm-optimized routing algorithm\nfunction optimizedRoutePower(nodes, demand) {\n  const stateMap = new Map(nodes.map(n => [n.id, n.capacity]));\n  // O(log N) traversal\n  return binarySearchPath(stateMap, demand);\n}",
        isResolving: false,
        metrics: { signal: 100, forks: targetPost.metrics.forks + 1, comments: 3 },
      };

      setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updatedPost } : p));
      if (activePost?.id === postId) {
        setActivePost(prev => ({ ...prev, ...updatedPost }));
      }
    }, 3000);
  };

  return (
    <div className="h-screen w-full bg-[#030305] text-gray-100 font-sans selection:bg-purple-500/30 antialiased overflow-hidden flex flex-col md:flex-row">
      {/* Deep Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_30%,transparent_100%)]" />
      </div>

      {/* Mobile Header */}
      <MobileHeader isMobileNavOpen={isMobileNavOpen} setIsMobileNavOpen={setIsMobileNavOpen} />

      {/* Syndicate Rail */}
      <SyndicateRail
        activeSyndicate={activeSyndicate}
        setActiveSyndicate={setActiveSyndicate}
        setActivePost={setActivePost}
        isMobileNavOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
      />

      {/* Stream Panel */}
      <StreamPanel
        activeSyndicate={activeSyndicate}
        posts={filteredPosts}
        activePost={activePost}
        setActivePost={setActivePost}
        composerText={composerText}
        setComposerText={setComposerText}
        onExecute={handleExecute}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Canvas */}
      <main className={`
        flex-1 h-[calc(100vh-53px)] md:h-screen relative z-30 flex flex-col bg-[#020203] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] md:shadow-none
        ${!activePost ? 'hidden md:flex' : 'flex absolute inset-0 md:relative'}
      `}>
        {activePost ? (
          <CanvasWorkspace
            post={activePost}
            onClose={() => setActivePost(null)}
            onFork={handleFork}
            onSummonSwarm={handleSummonSwarm}
          />
        ) : (
          <EmptyCanvasState user={CURRENT_USER} />
        )}
      </main>
    </div>
  );
}