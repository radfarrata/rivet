import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import AppSidebar, { MobileTopBar } from '../components/nexus/AppSidebar';
import FeedPanel from '../components/nexus/FeedPanel';
import PostDetail from '../components/nexus/PostDetail';
import ToastContainer from '../components/nexus/ToastContainer';
import CmdKPalette from '../components/nexus/CmdKPalette';
import {
  NotificationCenterView,
  ClaimedWorkWorkspace,
  PaymentsWorkspace,
  PerformanceIndexWorkspace,
  ChatNetworkView,
  AgentStudioWorkspace,
  ProfileWorkspace,
  WorkspaceSettingsModal,
  AppEmptyCanvas,
} from '../components/nexus/WorkspaceViews';
import { WORKSPACES, INITIAL_POSTS } from '../components/nexus/appData';

export default function NexusOS() {
  const queryClient = useQueryClient();

  // Auth / current user
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  // UI state
  const [activeSyndicate, setActiveSyndicate] = useState('global');
  const [activeView, setActiveView] = useState('network');
  const [activeFeedTab, setActiveFeedTab] = useState('trending');
  const [activePost, setActivePost] = useState(null);
  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [targetProfileData, setTargetProfileData] = useState(null);
  const [composerText, setComposerText] = useState('');
  const [postComposerType, setPostComposerType] = useState('task');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showWorkspaceSettings, setShowWorkspaceSettings] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(WORKSPACES[0]);
  const [myDeskItems, setMyDeskItems] = useState([]);
  const [personalFleet, setPersonalFleet] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [appError, setAppError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ⌘+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsCommandOpen(p => !p); }
      if (e.key === 'Escape') setIsCommandOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const triggerToast = (title, message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // --- DATA ---
  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const data = await base44.entities.Post.list('-created_date', 100);
      if (data.length === 0) {
        await base44.entities.Post.bulkCreate(INITIAL_POSTS);
        return base44.entities.Post.list('-created_date', 100);
      }
      return data;
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments'],
    queryFn: () => base44.entities.Comment.list('created_date', 500),
  });

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['chatMessages'],
    queryFn: () => base44.entities.ChatMessage.list('created_date', 200),
  });

  // Keep active post in sync with server data
  useEffect(() => {
    if (activePost) {
      const updated = posts.find(p => p.id === activePost.id);
      if (updated) setActivePost(updated);
    }
  }, [posts]);

  // --- MUTATIONS ---
  const createPostMutation = useMutation({
    mutationFn: data => base44.entities.Post.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['posts'] }); setComposerText(''); triggerToast('Request Published', 'Your execution request has been broadcast.'); },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Post.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  const createCommentMutation = useMutation({
    mutationFn: data => base44.entities.Comment.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments'] }),
  });

  const createChatMutation = useMutation({
    mutationFn: data => base44.entities.ChatMessage.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chatMessages'] }),
  });

  // --- HANDLERS ---
  const handlePost = () => {
    if (!composerText.trim()) return;
    const isTask = postComposerType === 'task';
    createPostMutation.mutate({
      title: isTask ? 'New Execution Request' : 'New Discussion',
      author: currentUser?.full_name || 'User',
      handle: `@${currentUser?.email?.split('@')[0] || 'dev'}`,
      time: 'Just now',
      syndicate: activeSyndicate === 'global' ? 'software' : activeSyndicate,
      postType: postComposerType,
      priority: 'Normal',
      content: composerText,
      upvotes: 1, forks: 0, replies: 0, signal: 100,
      bounty: isTask ? 250 : 0, token: 'USD',
      tags: ['New'], codeSnippet: isTask ? '// Specification initialized' : '',
      isAgent: false, status: 'open', verified: true, trustScore: 85,
      auditLog: [{ action: 'Created', user: currentUser?.full_name || 'User', time: new Date().toISOString() }],
    });
  };

  const handleUpvote = (post) => {
    updatePostMutation.mutate({ id: post.id, data: { upvotes: (post.upvotes || 0) + 1 } });
  };

  const handleFork = (post) => {
    if (myDeskItems.some(item => item.id === post.id)) { triggerToast('Already Claimed', 'This request is already in your Claimed Work.', 'info'); return; }
    const updatedLog = [...(post.auditLog || []), { action: 'Claimed', user: currentUser?.full_name || 'User', time: 'Just now' }];
    updatePostMutation.mutate({ id: post.id, data: { forks: (post.forks || 0) + 1, auditLog: updatedLog } });
    setMyDeskItems(prev => [...prev, post]);
    triggerToast('Work Claimed', 'Request added to your Claimed Work queue.');
  };

  const handleAddComment = (postId, content) => {
    if (!content.trim()) return;
    createCommentMutation.mutate({
      postId, content,
      authorName: currentUser?.full_name || 'User',
      handle: `@${currentUser?.email?.split('@')[0] || 'dev'}`,
    });
    const post = posts.find(p => p.id === postId);
    if (post) updatePostMutation.mutate({ id: postId, data: { replies: (post.replies || 0) + 1 } });
  };

  const handleSendChatMessage = (channelId, text) => {
    if (!text.trim()) return;
    createChatMutation.mutate({ channelId, authorName: currentUser?.full_name || 'User', text });
  };

  const handleSummonSwarm = async (post, selectedAgent, onComplete) => {
    const agentName = selectedAgent ? selectedAgent.name : 'Global Agent Fleet';
    triggerToast('Orchestrating Agent', `Initializing ${agentName}...`, 'info');
    const initLog = [...(post.auditLog || []), { action: 'Agent Orchestrated', user: currentUser?.full_name || 'User', details: `${agentName} Initiated`, time: 'Just now' }];
    updatePostMutation.mutate({ id: post.id, data: { isResolving: true, auditLog: initLog } });

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert software engineer. Solve this technical problem and return ONLY the code solution with comments:\n\nTitle: ${post.title}\n\nDescription: ${post.content}\n\nExisting code:\n${post.codeSnippet || '(none)'}`,
      });

      const aiFix = typeof result === 'string' ? result.replace(/```[a-z]*\n/gi, '').replace(/```/g, '') : JSON.stringify(result);
      const finalLog = [...initLog,
        { action: 'Execution Submitted', user: agentName, time: 'Just now' },
        { action: 'CI/CD Passed', user: 'System', details: 'Automated verification successful', time: 'Just now' },
        { action: 'Pending Approval', user: 'System', details: 'Awaiting human sign-off (0/2)', time: 'Just now' },
      ];

      updatePostMutation.mutate({
        id: post.id,
        data: {
          status: 'pending_approval',
          title: `[PENDING] ${post.title.replace('[PENDING] ', '')}`,
          isAgent: true, proposedFix: aiFix, isResolving: false,
          signal: 100, auditLog: finalLog,
        },
      });
      triggerToast('Execution Generated', 'The AI agent has proposed a resolution for review.');
      if (onComplete) onComplete();
    } catch (err) {
      updatePostMutation.mutate({ id: post.id, data: { isResolving: false } });
      setAppError(err.message);
    }
  };

  const handleCommandNavigate = (view, syndicate = null) => {
    if (syndicate) setActiveSyndicate(syndicate);
    setActiveView(view); setIsViewingProfile(false); setActivePost(null);
  };

  const openMyProfile = () => { setTargetProfileData(null); setIsViewingProfile(true); setActivePost(null); setActiveView('network'); setIsMobileNavOpen(false); };

  const openUserProfile = (authorData) => {
    if (authorData.created_by_id === currentUser?.id) { openMyProfile(); return; }
    setTargetProfileData({ uid: authorData.created_by_id, author: authorData.author, handle: authorData.handle, isAgent: authorData.isAgent, trustScore: authorData.trustScore || 80 });
    setIsViewingProfile(true); setActivePost(null); setActiveView('network'); setIsMobileNavOpen(false);
  };

  const openView = (view) => { setActiveView(view); setIsViewingProfile(false); setActivePost(null); setIsMobileNavOpen(false); };
  const closeAll = () => { setIsViewingProfile(false); setActivePost(null); setActiveView('network'); };

  // --- FILTER / SORT ---
  const filteredPosts = posts.filter(p => {
    const matchesSyndicate = activeSyndicate === 'global' || p.syndicate === activeSyndicate;
    const matchesSearch = (p.title + p.content + p.author).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSyndicate && matchesSearch;
  });

  const rankedPosts = [...filteredPosts].sort((a, b) =>
    activeFeedTab === 'trending' ? (b.upvotes || 0) - (a.upvotes || 0) : new Date(b.created_date) - new Date(a.created_date)
  );

  const isMainCanvasActive = activePost || isViewingProfile || ['studio', 'payments', 'performance', 'claimed'].includes(activeView);

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 overflow-hidden">
      <ToastContainer toasts={toasts}/>
      <CmdKPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} onNavigate={handleCommandNavigate}/>
      {showWorkspaceSettings && <WorkspaceSettingsModal workspace={activeWorkspace} onClose={() => setShowWorkspaceSettings(false)}/>}

      {appError && (
        <div className="fixed top-4 right-4 z-50 bg-red-950/90 text-red-100 px-4 py-3 rounded-lg border border-red-500/50 shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <span className="text-sm">{appError}</span>
          <button onClick={() => setAppError(null)} className="p-1 hover:bg-white/10 rounded">✕</button>
        </div>
      )}

      <MobileTopBar isMobileNavOpen={isMobileNavOpen} setIsMobileNavOpen={setIsMobileNavOpen}/>

      <AppSidebar
        currentUser={currentUser}
        activeSyndicate={activeSyndicate} setActiveSyndicate={setActiveSyndicate}
        activeView={activeView} openView={openView}
        activeWorkspace={activeWorkspace} setActiveWorkspace={setActiveWorkspace}
        isViewingProfile={isViewingProfile}
        openMyProfile={openMyProfile}
        setShowWorkspaceSettings={setShowWorkspaceSettings}
        isMobileNavOpen={isMobileNavOpen} setIsMobileNavOpen={setIsMobileNavOpen}
      />

      {/* Feed / Chat / Notifications in left pane */}
      {activeView === 'messages' ? (
        <div className={`${isMainCanvasActive ? 'hidden lg:flex' : 'flex'} w-full md:w-[380px] lg:w-[420px] h-full mt-[53px] md:mt-0 border-r border-zinc-800 flex-col z-20 flex-shrink-0`}>
          <ChatNetworkView messages={chatMessages} onSendMessage={handleSendChatMessage} currentSyndicate={activeSyndicate}/>
        </div>
      ) : activeView === 'notifications' ? (
        <div className={`${isMainCanvasActive ? 'hidden lg:flex' : 'flex'} w-full md:w-[380px] lg:w-[420px] h-full mt-[53px] md:mt-0 border-r border-zinc-800 flex-col z-20 flex-shrink-0`}>
          <NotificationCenterView/>
        </div>
      ) : (
        <FeedPanel
          activeWorkspace={activeWorkspace}
          activeSyndicate={activeSyndicate}
          activePost={activePost}
          activeView={activeView}
          activeFeedTab={activeFeedTab} setActiveFeedTab={setActiveFeedTab}
          setIsCommandOpen={setIsCommandOpen}
          composerText={composerText} setComposerText={setComposerText}
          postComposerType={postComposerType} setPostComposerType={setPostComposerType}
          handlePost={handlePost}
          loadingDb={loadingPosts}
          rankedPosts={rankedPosts}
          setActivePost={setActivePost}
          setActiveView={setActiveView}
          setIsViewingProfile={setIsViewingProfile}
          openUserProfile={openUserProfile}
          handleUpvote={handleUpvote}
          currentUser={currentUser}
          searchQuery={searchQuery}
        />
      )}

      {/* Main Canvas */}
      <main className={`
        flex-1 h-full mt-[53px] md:mt-0 relative z-30 flex flex-col bg-[#09090b] overflow-hidden
        ${!isMainCanvasActive ? 'hidden md:flex' : 'flex absolute inset-0 md:relative'}
      `}>
        {activeView === 'claimed' ? (
          <ClaimedWorkWorkspace deskItems={myDeskItems} onClose={() => setActiveView('network')} onSelectTask={id => { const p = posts.find(x => x.id === id); if (p) { setActivePost(p); setActiveView('network'); }}}/>
        ) : activeView === 'studio' ? (
          <AgentStudioWorkspace onClose={() => setActiveView('network')} onAgentTrained={a => setPersonalFleet(prev => [...prev, a])} triggerToast={triggerToast}/>
        ) : activeView === 'payments' ? (
          <PaymentsWorkspace onClose={() => setActiveView('network')} triggerToast={triggerToast}/>
        ) : activeView === 'performance' ? (
          <PerformanceIndexWorkspace onClose={() => setActiveView('network')} onAvatarClick={openUserProfile}/>
        ) : isViewingProfile ? (
          <ProfileWorkspace currentUser={currentUser} targetProfile={targetProfileData} onClose={closeAll} triggerToast={triggerToast}/>
        ) : activePost ? (
          <PostDetail
            post={activePost} comments={comments} personalFleet={personalFleet}
            onAddComment={handleAddComment} onClose={closeAll}
            onFork={() => handleFork(activePost)}
            onSummonSwarm={(agent, cb) => handleSummonSwarm(activePost, agent, cb)}
            onAvatarClick={openUserProfile}
            triggerToast={triggerToast}
          />
        ) : (
          <AppEmptyCanvas onCmdK={() => setIsCommandOpen(true)}/>
        )}
      </main>
    </div>
  );
}