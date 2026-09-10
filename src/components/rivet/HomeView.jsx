import React, { useState } from 'react';
import HomeHero from './home/HomeHero';
import RecentEvaluations from './home/RecentEvaluations';
import ExploreByDomain from './home/ExploreByDomain';
import HomeRightRail from './HomeRightRail';
import EvaluationTaskDetail from './EvaluationTaskDetail';

export default function HomeView({ currentUser, onNavigate }) {
  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <div className="flex gap-6 items-start max-w-[1100px] mx-auto">
      {/* Center column — X-style single feed spine */}
      <div className="flex-1 min-w-0 w-full border-x border-[#1f232e] -my-4 md:-my-6 px-4 md:px-6 py-4 md:py-6 space-y-5">
        <HomeHero currentUser={currentUser} onNavigate={onNavigate} />
        <ExploreByDomain onNavigate={onNavigate} />
        <RecentEvaluations currentUser={currentUser} onNavigate={onNavigate} onOpenTask={setSelectedTask} />
      </div>

      {/* Right rail — sticky widget stack */}
      <div className="hidden lg:block sticky top-0 self-start">
        <HomeRightRail currentUser={currentUser} onNavigate={onNavigate} onOpenTask={setSelectedTask} />
      </div>

      {selectedTask && <EvaluationTaskDetail task={selectedTask} currentUser={currentUser} onClose={() => setSelectedTask(null)} />}
    </div>
  );
}