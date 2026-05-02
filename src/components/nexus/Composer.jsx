import React from 'react';
import { Terminal, Code, Bot, Database } from 'lucide-react';
import GlassButton from './GlassButton';

export default function Composer({ composerText, setComposerText, onExecute }) {
  return (
    <div className="bg-gradient-to-b from-[#0a0a0c] to-transparent border border-white/10 rounded-xl p-1 shadow-inner focus-within:border-cyan-500/50 transition-all duration-300 mb-4">
      <div className="flex items-start gap-3 p-3">
        <Terminal className="w-4 h-4 text-cyan-500 mt-1 flex-shrink-0" />
        <textarea
          value={composerText}
          onChange={(e) => setComposerText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              onExecute();
            }
          }}
          placeholder="Initialize node or deploy agent... (⌘+Enter)"
          className="w-full bg-transparent border-none outline-none resize-none text-[13px] text-gray-200 placeholder-gray-600 min-h-[50px] font-mono leading-relaxed"
        />
      </div>
      <div className="flex items-center justify-between p-2 bg-[#050507]/50 border-t border-white/5 rounded-b-lg">
        <div className="flex items-center gap-1 md:gap-4 overflow-x-auto scrollbar-hide">
          <button
            className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider px-2 py-1 whitespace-nowrap group"
            onClick={() => setComposerText(prev => prev + (prev ? '\n' : '') + '[LOGIC_ATTACHED: src/main.rs]')}
          >
            <Code size={14} className="text-gray-500 group-hover:text-cyan-400 transition-colors" /> ATTACH LOGIC
          </button>
          <button
            className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider px-2 py-1 whitespace-nowrap group"
            onClick={() => setComposerText(prev => prev + (prev ? '\n' : '') + '[AGENT_ASSIGNED: swarm.sigma]')}
          >
            <Bot size={14} className="text-gray-500 group-hover:text-purple-400 transition-colors" /> ASSIGN AGENT
          </button>
          <button
            className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider px-2 py-1 whitespace-nowrap group"
            onClick={() => setComposerText(prev => prev + (prev ? '\n' : '') + '[DATA_BOUND: ipfs://...]')}
          >
            <Database size={14} className="text-gray-500 group-hover:text-orange-400 transition-colors" /> BIND DATA
          </button>
        </div>
        <GlassButton variant="agent" className="!py-1.5 !px-3 md:!px-4 text-xs font-bold shrink-0 ml-2" onClick={onExecute}>
          Deploy
        </GlassButton>
      </div>
    </div>
  );
}