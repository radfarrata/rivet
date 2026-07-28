import React from 'react';
import ProjectsView from './views/ProjectsView';
import FeedView from './views/FeedView';
import CommunityViews from './views/CommunityViews';
import WalletViews from './views/WalletViews';
import BuildViews from './views/BuildViews';
import TrainViews from './views/TrainViews';

export default function ContentView({ activeNav, currentUser, onViewProfile }) {
  switch (activeNav) {
    case 'projects': return <ProjectsView currentUser={currentUser} onViewProfile={onViewProfile} />;
    case 'build-tasks': return <ProjectsView mode="my-tasks" currentUser={currentUser} onViewProfile={onViewProfile} />;
    case 'train-tasks': return <ProjectsView mode="training" currentUser={currentUser} onViewProfile={onViewProfile} />;
    case 'feed': return <FeedView currentUser={currentUser} onViewProfile={onViewProfile} />;
    case 'discussions': return <CommunityViews mode="discussions" currentUser={currentUser} onViewProfile={onViewProfile} />;
    case 'events': return <CommunityViews mode="events" currentUser={currentUser} />;
    case 'wallet': return <WalletViews mode="wallet" />;
    case 'withdraw': return <WalletViews mode="withdraw" />;
    case 'transactions': return <WalletViews mode="transactions" />;
    case 'ai-assistants': return <BuildViews mode="assistants" />;
    case 'teams': return <BuildViews mode="teams" />;
    case 'training-hub': return <TrainViews mode="hub" />;
    case 'quality': return <TrainViews mode="quality" />;
    case 'leaderboard': return <TrainViews mode="leaderboard" onViewProfile={onViewProfile} />;
    default: return null;
  }
}