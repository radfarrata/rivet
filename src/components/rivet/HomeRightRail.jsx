import React from 'react';
import { Search } from 'lucide-react';
import YourImpactCard from './home/YourImpactCard';
import RecommendedTasksCard from './home/RecommendedTasksCard';
import TrendingTasksCard from './home/TrendingTasksCard';
import LeaderboardCard from './home/LeaderboardCard';
import RecentActivityCard from './home/RecentActivityCard';

export default function HomeRightRail({ currentUser, onNavigate, onOpenTask, searchQuery, onSearchChange }) {
  return (
    <aside className="w-[300px] flex-shrink-0 flex flex-col gap-4 max-h-screen overflow-y-auto scrollbar-hide py-3">
      <div className="sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71767b]" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={e => onSearchChange?.(e.target.value)}
            placeholder="Search"
            className="w-full bg-[#202327] border border-transparent focus:border-[#b06d97] focus:bg-black rounded-full py-2.5 pl-11 pr-4 text-sm text-white placeholder-[#71767b] focus:outline-none transition-colors"
          />
        </div>
      </div>
      <TrendingTasksCard currentUser={currentUser} onNavigate={onNavigate} onOpenTask={onOpenTask} />
      <LeaderboardCard onNavigate={onNavigate} />
      <RecentActivityCard currentUser={currentUser} onNavigate={onNavigate} />
      <YourImpactCard currentUser={currentUser} onNavigate={onNavigate} />
      <RecommendedTasksCard currentUser={currentUser} onOpenTask={onOpenTask} />
    </aside>
  );
}