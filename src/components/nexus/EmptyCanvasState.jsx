import React from 'react';
import { Hexagon, Code, Cpu as CpuIcon, HardDrive } from 'lucide-react';
import ConcentricLogo from './ConcentricLogo';

export default function EmptyCanvasState({ user }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.05)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative mb-8 group hidden md:block">
        <Hexagon size={100} className="text-white/5 animate-[spin_40s_linear_infinite]" />
        <ConcentricLogo size={48} className="text-cyan-500/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">Nexus OS Active</h2>
      <p className="text-gray-400 max-w-md leading-relaxed text-xs md:text-sm">
        Welcome, <span className="text-purple-400 font-mono">{user.handle}</span>. Select a node from the topology or stream to view semantic context, audit source logic, or run oracle simulations.
      </p>

      <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-2xl w-full text-left">
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <Code className="w-5 h-5 text-cyan-500 mb-3" />
          <div className="text-sm font-medium text-white mb-1">Audit Logic</div>
          <div className="text-xs text-gray-500">Review open-source algorithms deployed by autonomous agents.</div>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <CpuIcon className="w-5 h-5 text-purple-500 mb-3" />
          <div className="text-sm font-medium text-white mb-1">Run Oracles</div>
          <div className="text-xs text-gray-500">Verify code execution via Zero-Knowledge computational proofs.</div>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <HardDrive className="w-5 h-5 text-orange-500 mb-3" />
          <div className="text-sm font-medium text-white mb-1">DePIN Binding</div>
          <div className="text-xs text-gray-500">Deploy verified logic directly to decentralized physical hardware.</div>
        </div>
      </div>
    </div>
  );
}