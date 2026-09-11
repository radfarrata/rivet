import React, { useState } from 'react';
import HomeHero from './home/HomeHero';
import RecentEvaluations from './home/RecentEvaluations';
import HomeRightRail from './HomeRightRail';
import EvaluationTaskDetail from './EvaluationTaskDetail';

export default function HomeView({ currentUser, onNavigate, searchQuery, onSearchChange }) {
  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <div className="flex gap-6 items-start mx-auto max-w-[990px]">
      {/* Center column — X-style feed spine */}
      <div className="flex-1 min-w-0 w-full border-x border-[#2f3336] min-h-screen">
        <HomeHero currentUser={currentUser} onNavigate={onNavigate} />
        <RecentEvaluations currentUser={currentUser} onNavigate={onNavigate} onOpenTask={setSelectedTask} />
      </div>

      {/* Right rail — sticky widget stack */}
      <div className="hidden lg:block sticky top-0 self-start">
        <HomeRightRail currentUser={currentUser} onNavigate={onNavigate} onOpenTask={setSelectedTask} searchQuery={searchQuery} onSearchChange={onSearchChange} />
      </div>

      {selectedTask && <EvaluationTaskDetail task={selectedTask} currentUser={currentUser} onClose={() => setSelectedTask(null)} />}
    </div>
  );
}