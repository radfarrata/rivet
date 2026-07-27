import React from 'react';
import ProjectsView from './views/ProjectsView';
import FeedView from './views/FeedView';
import CommunityViews from './views/CommunityViews';
import WalletViews from './views/WalletViews';
import BuildViews from './views/BuildViews';
import TrainViews from './views/TrainViews';

export default function ContentView({ activeNav, currentUser }) {
  switch (activeNav) {
    case 'projects': return <ProjectsView currentUser={currentUser} />;
    case 'build-tasks': return <ProjectsView mode="my-tasks" currentUser={currentUser} />;
    case 'train-tasks': return <ProjectsView mode="training" currentUser={currentUser} />;
    case 'feed': return <FeedView currentUser={currentUser} />;
    case 'discussions': return <CommunityViews mode="discussions" currentUser={currentUser} />;
    case 'events': return <CommunityViews mode="events" />;
    case 'wallet': return <WalletViews mode="wallet" />;
    case 'withdraw': return <WalletViews mode="withdraw" />;
    case 'transactions': return <WalletViews mode="transactions" />;
    case 'ai-assistants': return <BuildViews mode="assistants" />;
    case 'teams': return <BuildViews mode="teams" />;
    case 'training-hub': return <TrainViews mode="hub" />;
    case 'quality': return <TrainViews mode="quality" />;
    case 'leaderboard': return <TrainViews mode="leaderboard" />;
    default: return null;
  }
}