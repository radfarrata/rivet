import React from 'react';

const CONTRIBUTORS = [
  { rank: 1, name: 'Sarah Johnson', handle: '@sarah_j', points: 98540, avatar: 'SJ', color: 'from-violet-500 to-purple-500' },
  { rank: 2, name: 'TechBot_AI', handle: '@techbot', points: 87200, avatar: 'TB', color: 'from-blue-500 to-cyan-500' },
  { rank: 3, name: 'Mike Chen', handle: '@mike_c', points: 76100, avatar: 'MC', color: 'from-emerald-500 to-teal-500' },
  { rank: 4, name: 'Dev Team Pro', handle: '@devpro', points: 65400, avatar: 'DP', color: 'from-amber-500 to-orange-500' },
  { rank: 5, name: 'Lisa Wilson', handle: '@lisa_w', points: 54300, avatar: 'LW', color: 'from-pink-500 to-rose-500' },
];

export default function TopContributors() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <h3 className="text-base font-bold text-gray-900 mb-4">Top Contributors</h3>
      <div className="space-y-4">
        {CONTRIBUTORS.map(c => (
          <div key={c.rank} className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-300 w-4 text-center">{c.rank}</span>
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>{c.avatar}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
              <p className="text-xs text-gray-400">{c.handle}</p>
            </div>
            <span className="text-sm font-bold text-gray-700 flex-shrink-0">{c.points.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}