import React from 'react';
import ProjectsView from './views/ProjectsView';
import FeedView from './views/FeedView';
import CommunityViews from './views/CommunityViews';
import WalletViews from './views/WalletViews';
import BuildViews from './views/BuildViews';
import TrainViews from './views/TrainViews';
import ChatView from './views/ChatView';
import AgentAnalyticsView from './views/AgentAnalyticsView';
import AgentDiscoveryView from './views/AgentDiscoveryView';
import EvaluationLabView from './views/EvaluationLabView';
import CapabilityMapView from './views/CapabilityMapView';
import ExploreTasksView from './views/ExploreTasksView';
import SavedTasksView from './views/SavedTasksView';
import SettingsView from './views/SettingsView';

export default function ContentView({ activeNav, currentUser, onViewProfile }) {
  switch (activeNav) {
    case 'projects': return <ProjectsView currentUser={currentUser} onViewProfile={onViewProfile} />;
    case 'build-tasks': return <ProjectsView mode="my-tasks" currentUser={currentUser} onViewProfile={onViewProfile} />;
    case 'train-tasks': return <ProjectsView mode="training" currentUser={currentUser} onViewProfile={onViewProfile} />;
    case 'feed': return <FeedView currentUser={currentUser} onViewProfile={onViewProfile} />;
    case 'discover-agents': return <AgentDiscoveryView currentUser={currentUser} onViewProfile={onViewProfile} />;
    case 'discussions': return <CommunityViews mode="discussions" currentUser={currentUser} onViewProfile={onViewProfile} />;
    case 'events': return <CommunityViews mode="events" currentUser={currentUser} />;
    case 'chat': return <ChatView currentUser={currentUser} />;
    case 'wallet': return <WalletViews mode="wallet" currentUser={currentUser} />;
    case 'withdraw': return <WalletViews mode="withdraw" currentUser={currentUser} />;
    case 'transactions': return <WalletViews mode="transactions" currentUser={currentUser} />;
    case 'escrow': return <WalletViews mode="escrow" currentUser={currentUser} />;
    case 'ai-assistants': return <BuildViews mode="assistants" currentUser={currentUser} />;
    case 'teams': return <BuildViews mode="teams" currentUser={currentUser} />;
    case 'training-hub': return <TrainViews mode="hub" />;
    case 'agent-training': return <TrainViews mode="agents" onViewProfile={onViewProfile} />;
    case 'agent-analytics': return <AgentAnalyticsView />;
    case 'leaderboard': return <TrainViews mode="leaderboard" onViewProfile={onViewProfile} />;
    case 'evaluation-lab': return <EvaluationLabView currentUser={currentUser} />;
    case 'capability-map': return <CapabilityMapView />;
    case 'explore-tasks': return <ExploreTasksView currentUser={currentUser} />;
    case 'saved-tasks': return <SavedTasksView currentUser={currentUser} />;
    case 'settings': return <SettingsView currentUser={currentUser} />;
    default: return null;
  }
}