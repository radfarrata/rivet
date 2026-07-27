import React from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

const PROJECTS = [
  { id: 1, name: 'Mobile App Redesign', progress: 75, color: 'bg-violet-500' },
  { id: 2, name: 'API Migration v2', progress: 40, color: 'bg-blue-500' },
  { id: 3, name: 'Design System Update', progress: 90, color: 'bg-emerald-500' },
  { id: 4, name: 'ML Pipeline Optimization', progress: 25, color: 'bg-amber-500' },
];

const EARNINGS_DATA = [
  { day: 'Mon', amount: 420 },
  { day: 'Tue', amount: 650 },
  { day: 'Wed', amount: 380 },
  { day: 'Thu', amount: 720 },
  { day: 'Fri', amount: 950 },
  { day: 'Sat', amount: 530 },
  { day: 'Sun', amount: 410 },
];

function YourProgress() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <h3 className="text-base font-bold text-gray-900 mb-4">Your Progress</h3>
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
            <defs>
              <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f0f5" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#progGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="66" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-xl font-bold text-gray-900">28</span>
              <p className="text-[10px] text-gray-400">tasks</p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between"><span className="text-gray-500">Design</span><span className="font-medium text-gray-700">12 tasks</span></div>
        <div className="flex items-center justify-between"><span className="text-gray-500">Development</span><span className="font-medium text-gray-700">9 tasks</span></div>
        <div className="flex items-center justify-between"><span className="text-gray-500">Training</span><span className="font-medium text-gray-700">7 tasks</span></div>
        <div className="flex items-center justify-between"><span className="text-gray-500">Avg. Accuracy</span><span className="font-medium text-green-600">94%</span></div>
      </div>
    </div>
  );
}

function RecentProjects() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <h3 className="text-base font-bold text-gray-900 mb-4">Recent Projects</h3>
      <div className="space-y-4">
        {PROJECTS.map(p => (
          <div key={p.id}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-800 truncate">{p.name}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">{p.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EarningsOverview() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <h3 className="text-base font-bold text-gray-900 mb-1">Earnings Overview</h3>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold text-gray-900">$2,840</span>
        <span className="text-xs text-gray-400">this week</span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={EARNINGS_DATA}>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">Total this month</span>
        <span className="text-sm font-bold text-gray-700">$11,200</span>
      </div>
    </div>
  );
}

export default function DashboardWidgets() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <YourProgress />
      <RecentProjects />
      <EarningsOverview />
    </div>
  );
}