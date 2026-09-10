import React from 'react';
import YourImpactCard from './home/YourImpactCard';
import RecommendedTasksCard from './home/RecommendedTasksCard';
import TrendingTasksCard from './home/TrendingTasksCard';
import LeaderboardCard from './home/LeaderboardCard';
import RecentActivityCard from './home/RecentActivityCard';

export default function HomeRightRail({ currentUser, onNavigate, onOpenTask }) {
  return (
    <aside className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-4 self-start">
      <YourImpactCard currentUser={currentUser} onNavigate={onNavigate} />
      <RecommendedTasksCard currentUser={currentUser} onOpenTask={onOpenTask} />
      <TrendingTasksCard currentUser={currentUser} onNavigate={onNavigate} onOpenTask={onOpenTask} />
      <LeaderboardCard onNavigate={onNavigate} />
      <RecentActivityCard currentUser={currentUser} onNavigate={onNavigate} />
    </aside>
  );
}