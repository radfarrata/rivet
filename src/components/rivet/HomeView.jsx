import React, { useState } from 'react';
import HomeHero from './home/HomeHero';
import RecentEvaluations from './home/RecentEvaluations';
import HomeRightRail from './HomeRightRail';
import EvaluationTaskDetail from './EvaluationTaskDetail';
import HomeHeroHeadline from './home/HomeHeroHeadline';
import ExploreByDomain from './home/ExploreByDomain';

export default function HomeView({ currentUser, onNavigate, searchQuery, onSearchChange }) {
  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <div className="flex gap-6 items-start mx-auto max-w-[990px]">
      {/* Center column — X-style feed spine */}
      <div className="flex-1 min-w-0 w-full border-x border-[#2f3336] min-h-screen opacity-100">
        <div className="px-4 pt-5 pb-4 border-b border-[#2f3336]"><HomeHeroHeadline /></div>
        <HomeHero currentUser={currentUser} onNavigate={onNavigate} />
        <RecentEvaluations currentUser={currentUser} onNavigate={onNavigate} onOpenTask={setSelectedTask} />
        <div className="px-4 py-5"><ExploreByDomain onNavigate={onNavigate} /></div>
      </div>

      {/* Right rail — sticky widget stack */}
      <div className="hidden lg:block sticky top-0 self-start">
        <HomeRightRail currentUser={currentUser} onNavigate={onNavigate} onOpenTask={setSelectedTask} searchQuery={searchQuery} onSearchChange={onSearchChange} />
      </div>

      {selectedTask && <EvaluationTaskDetail task={selectedTask} currentUser={currentUser} onClose={() => setSelectedTask(null)} />}
    </div>);

}