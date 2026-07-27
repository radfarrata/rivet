import React, { useState } from 'react';
import { PenTool, Bug, FileText, MessageSquare, Image as ImageIcon, Code } from 'lucide-react';

const BUILD_TASKS = [
  { id: 1, title: 'Landing Page Design', tags: ['Design', 'UI/UX'], points: 350, deadline: '2d left', icon: <PenTool size={18} /> },
  { id: 2, title: 'Fix Authentication Bug', tags: ['Backend', 'Security'], points: 500, deadline: '5h left', icon: <Bug size={18} /> },
  { id: 3, title: 'Blog Post: Tech Trends 2026', tags: ['Writing', 'Content'], points: 200, deadline: '3d left', icon: <FileText size={18} /> },
];

const TRAINING_TASKS = [
  { id: 4, title: 'Rate Chatbot Responses', tags: ['RLHF', 'Quality'], points: 80, deadline: '1d left', icon: <MessageSquare size={18} /> },
  { id: 5, title: 'Label Images for Dataset', tags: ['Vision', 'Data'], points: 150, deadline: '4d left', icon: <ImageIcon size={18} /> },
  { id: 6, title: 'Evaluate Code Outputs', tags: ['Code', 'Quality'], points: 120, deadline: '6h left', icon: <Code size={18} /> },
];

export default function RecommendedTasks() {
  const [tab, setTab] = useState('build');
  const tasks = tab === 'build' ? BUILD_TASKS : TRAINING_TASKS;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 px-6 py-4">
        <h3 className="text-base font-bold text-gray-900">Recommended for you</h3>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setTab('build')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${tab === 'build' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Build Tasks</button>
          <button onClick={() => setTab('training')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${tab === 'training' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Training Tasks</button>
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-600">
              {task.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {task.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{tag}</span>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-green-600">+{task.points} pts</p>
              <p className="text-xs text-gray-400">{task.deadline}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}