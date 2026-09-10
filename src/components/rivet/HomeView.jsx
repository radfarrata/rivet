import React, { useState } from 'react';
import HomeHero from './home/HomeHero';
import RecentEvaluations from './home/RecentEvaluations';
import ExploreByDomain from './home/ExploreByDomain';
import HomeRightRail from './HomeRightRail';
import EvaluationTaskDetail from './EvaluationTaskDetail';

export default function HomeView({ currentUser, onNavigate }) {
  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start max-w-[1200px] mx-auto">
      <div className="flex-1 min-w-0 w-full space-y-8">
        <HomeHero currentUser={currentUser} onNavigate={onNavigate} />
        <RecentEvaluations onNavigate={onNavigate} onOpenTask={setSelectedTask} />
        <ExploreByDomain onNavigate={onNavigate} />
      </div>
      <HomeRightRail onNavigate={onNavigate} onOpenTask={setSelectedTask} />
      {selectedTask && <EvaluationTaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </div>
  );
}