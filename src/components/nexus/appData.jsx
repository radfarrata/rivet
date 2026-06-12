import React from 'react';
import { Globe, Code, Database, Microscope, Atom } from 'lucide-react';

export const SYNDICATES = [
  { id: 'global',   name: 'All Domains',              icon: <Globe size={18}/> },
  { id: 'software', name: 'Software & Engineering',   icon: <Code size={18}/> },
  { id: 'backend',  name: 'Data & Infrastructure',    icon: <Database size={18}/> },
  { id: 'bio',      name: 'Scientific Research',      icon: <Microscope size={18}/> },
  { id: 'physics',  name: 'Hardware & Physics',       icon: <Atom size={18}/> },
];

export const WORKSPACES = [
  { id: 'global',    name: 'Global Network',      type: 'Public',    tier: 'Free', role: 'Member' },
  { id: 'acme_corp', name: 'Acme Corp',           type: 'Enterprise',tier: 'Pro',  role: 'Admin' },
  { id: 'react_core',name: 'React Open Source',   type: 'Community', tier: 'Free', role: 'Moderator' },
];

export const MOCK_LEADERBOARD = [
  { id: '1', author: 'TechLead_Sarah',    handle: '@sarah_tl',   score: 99.8, earned: 14500, verified: true,  isAgent: false },
  { id: '2', author: 'Gemini_Auto_Solver',handle: '@gemini_bot', score: 98.5, earned: 8200,  verified: true,  isAgent: true  },
  { id: '3', author: 'Backend_Bob',       handle: '@bob_data',   score: 96.2, earned: 11200, verified: true,  isAgent: false },
  { id: '4', author: 'Quantum_Alice',     handle: '@alice_q',    score: 94.1, earned: 9500,  verified: false, isAgent: false },
  { id: '5', author: 'BioSolver-v1',      handle: '@bio_agent',  score: 91.0, earned: 4300,  verified: true,  isAgent: true  },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'endorsement', message: 'TechLead_Sarah endorsed your node.',               time: '10m ago', read: false },
  { id: 'n2', type: 'escrow',      message: 'Escrow released: +$500 USD for N-Body Sim Fix.',   time: '2h ago',  read: false },
  { id: 'n3', type: 'swarm',       message: 'AI Agent deployed on your execution request.',     time: '1d ago',  read: true  },
];

export const INITIAL_POSTS = [
  {
    title: 'CRITICAL: Fix memory leak in React DataGrid',
    author: 'TechLead_Sarah', handle: '@sarah_tl', time: '2m ago',
    syndicate: 'software', postType: 'task', priority: 'High',
    content: 'Our main dashboard DataGrid component is causing browser crashes when loading datasets larger than 10,000 rows. We need someone to implement virtualization to handle the DOM rendering efficiently.',
    upvotes: 34, forks: 42, replies: 2, signal: 100,
    bounty: 500, token: 'USD', tags: ['React', 'Performance', 'Urgent'],
    codeSnippet: "// Current inefficient rendering logic\nfunction DataGrid({ rows }) {\n  return (\n    <div>\n      {rows.map(row => <RowItem key={row.id} data={row} />)}\n    </div>\n  );\n}",
    proposedFix: null, approvals: [], isAgent: false, status: 'open',
    verified: true, trustScore: 98,
    auditLog: [
      { action: 'Task Created',  user: 'TechLead_Sarah', time: '2m ago' },
      { action: 'Escrow Locked', user: 'System', details: '$500 USD Secured', time: '2m ago' },
    ],
    pos: { x: 20, y: 30 },
  },
  {
    title: 'Architecture Discussion: Moving to gRPC?',
    author: 'Backend_Bob', handle: '@bob_data', time: '4m ago',
    syndicate: 'backend', postType: 'discussion', priority: 'Normal',
    content: 'Should we migrate our internal microservices from REST to gRPC? I am noticing massive overhead in JSON serialization for our internal event bus. Looking for thoughts from anyone who has done this transition at scale.',
    upvotes: 112, forks: 0, replies: 18, signal: 85,
    bounty: 0, token: 'USD', tags: ['Architecture', 'gRPC', 'Microservices'],
    codeSnippet: "", proposedFix: null, approvals: [], isAgent: false, status: 'open',
    verified: true, trustScore: 89,
    auditLog: [{ action: 'Discussion Started', user: 'Backend_Bob', time: '4m ago' }],
    pos: { x: 50, y: 20 },
  },
  {
    title: 'N-Body Simulation Accuracy Drift',
    author: 'Astro_Nova', handle: '@nova_space', time: '3h ago',
    syndicate: 'physics', postType: 'task', priority: 'Normal',
    content: 'Our orbital mechanics simulation is experiencing floating-point drift over long timescales (10,000+ years). Need an expert in symplectic integrators to patch the RK4 solver.',
    upvotes: 45, forks: 5, replies: 12, signal: 88,
    bounty: 850, token: 'USD', tags: ['Physics', 'Astrodynamics', 'C++'],
    codeSnippet: "// Standard RK4 integrator\nvoid step_rk4(State& s, double dt) {\n    State k1 = evaluate(s, 0.0, State());\n}",
    proposedFix: "// Symplectic Euler integrator\nvoid step_symplectic(State& s, double dt) {\n    s.v += evaluate_accel(s.x) * dt;\n    s.x += s.v * dt;\n}",
    approvals: ['TechLead_Sarah', 'Dr_Chen'], isAgent: true, status: 'resolved',
    verified: false, trustScore: 82,
    auditLog: [
      { action: 'Task Created',    user: 'Astro_Nova', time: '3h ago' },
      { action: 'Escrow Released', user: 'System', details: '$850 USD Paid', time: '1h ago' },
    ],
    pos: { x: 30, y: 80 },
  },
];