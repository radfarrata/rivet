import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bot, Users, Plus } from 'lucide-react';

const TEAMS = [
  { id: 1, name: 'Frontend Wizards', members: 12, projects: 8, color: 'from-violet-500 to-purple-500', avatar: 'FW' },
  { id: 2, name: 'Backend Squad', members: 8, projects: 5, color: 'from-blue-500 to-cyan-500', avatar: 'BS' },
  { id: 3, name: 'AI Training Lab', members: 15, projects: 3, color: 'from-emerald-500 to-teal-500', avatar: 'AL' },
  { id: 4, name: 'Design System', members: 6, projects: 4, color: 'from-amber-500 to-orange-500', avatar: 'DS' },
];

export default function BuildViews({ mode = 'assistants' }) {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['rivet-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50),
  });

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe(() => queryClient.invalidateQueries({ queryKey: ['rivet-posts'] }));
    return unsub;
  }, [queryClient]);

  if (mode === 'teams') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-bold text-gray-900">Teams</h2><p className="text-sm text-gray-500 mt-0.5">Collaborate with your team members</p></div>
          <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"><Plus size={16} /> New Team</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEAMS.map(team => (
            <div key={team.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${team.color} flex items-center justify-center text-white font-bold text-sm mb-3`}>{team.avatar}</div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{team.name}</h3>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Users size={14} /> {team.members} members</span>
                <span>{team.projects} projects</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const agents = posts.filter(p => p.isAgent);

  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-gray-900">AI Assistants</h2><p className="text-sm text-gray-500 mt-0.5">Autonomous agents active on the network</p></div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}</div>
      ) : agents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Bot className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No AI assistants found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white"><Bot size={18} /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{agent.author}</p><p className="text-xs text-gray-400">{agent.handle}</p></div>
                <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Active</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{agent.content}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>Trust: {agent.trustScore || 0}</span>
                <span>•</span>
                <span>{agent.upvotes || 0} upvotes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}