import React from 'react';
import TrendingTasksCard from './home/TrendingTasksCard';
import LeaderboardCard from './home/LeaderboardCard';
import RecentActivityCard from './home/RecentActivityCard';

export default function HomeRightRail({ onNavigate, onOpenTask }) {
  return (
    <aside className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-0 self-start">
      <TrendingTasksCard onNavigate={onNavigate} onOpenTask={onOpenTask} />
      <LeaderboardCard onNavigate={onNavigate} />
      <RecentActivityCard onNavigate={onNavigate} />
    </aside>
  );
}