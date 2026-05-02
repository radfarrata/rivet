import React, { useState, useEffect, useRef } from 'react';
import { Play, Activity, CheckCircle2, HardDrive, Radio } from 'lucide-react';
import GlassButton from './GlassButton';

export default function OracleEngine({ post }) {
  const [simState, setSimState] = useState('idle');
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);
  const timersRef = useRef([]);

  // Clear all pending timers and reset on post change
  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setSimState('idle');
    setLogs([]);
  }, [post.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toISOString().substring(11, 19), msg, type }]);
  };

  const schedule = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  };

  const runSimulation = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setSimState('compiling');
    setLogs([{ time: new Date().toISOString().substring(11, 19), msg: 'Initiating Zero-Knowledge Sandbox...', type: 'sys' }]);

    schedule(() => {
      addLog('Compiling AST and resolving network vectors...', 'sys');
      schedule(() => {
        setSimState('running');
        addLog('Execution environment active.', 'success');
        addLog('Injecting 500,000 synthetic state mutations...', 'info');

        [0, 300, 600, 900].forEach((delay, i) => {
          schedule(() => {
            addLog(`Verifying branch constraint ${Math.floor(Math.random() * 90000)} - O(1) Pass`, 'info');
          }, delay);
        });

        schedule(() => {
          addLog('Generating ZK-SNARK Proof...', 'warn');
          schedule(() => {
            setSimState('verified');
            addLog(`Mathematical Proof Verified: 0x${Math.random().toString(16).substring(2, 10)}...`, 'success');
            addLog('Algorithm improves baseline efficiency by 14.2%', 'success');
            schedule(() => {
              setSimState('deployable');
              addLog('Ready for Physical Infrastructure (DePIN) Binding.', 'warn');
            }, 1000);
          }, 1500);
        }, 1800);
      }, 1500);
    }, 1000);
  };

  const handleDePINDeploy = () => {
    setSimState('deploying');
    addLog('Binding verified logic to Edge Cluster (US-West)...', 'sys');
    schedule(() => {
      setSimState('deployed');
      addLog('HARDWARE BINDING COMPLETE. Code is live on physical infrastructure.', 'success');
    }, 2000);
  };

  const logColors = {
    sys: 'text-gray-500',
    info: 'text-cyan-400',
    success: 'text-emerald-400',
    warn: 'text-orange-400',
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 max-w-4xl mx-auto w-full animate-in fade-in">
      {/* Metrics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 md:mb-6">
        <div className="bg-black/40 border border-white/5 rounded-xl p-3 md:p-4 shadow-inner">
          <div className="text-[9px] md:text-[10px] font-mono text-gray-500 uppercase mb-1 md:mb-2">Compute Required</div>
          <div className="flex items-end gap-2">
            <div className="text-xl md:text-2xl font-medium text-white">4.2</div>
            <div className="text-xs md:text-sm text-cyan-400 mb-1">TFLOPS</div>
          </div>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-xl p-3 md:p-4 shadow-inner">
          <div className="text-[9px] md:text-[10px] font-mono text-gray-500 uppercase mb-1 md:mb-2">ZK-Proof Cost</div>
          <div className="flex items-end gap-2">
            <div className="text-xl md:text-2xl font-medium text-white">0.05</div>
            <div className="text-xs md:text-sm text-gray-400 mb-1">SYS</div>
          </div>
        </div>

        <div className="col-span-2 flex items-center justify-center">
          {simState === 'idle' && (
            <GlassButton variant="primary" className="w-full h-full text-sm md:text-lg border-purple-500/50 hover:bg-purple-600/30 py-4" onClick={runSimulation}>
              <Play className="mr-2" /> Run ZK Verification
            </GlassButton>
          )}
          {(simState === 'compiling' || simState === 'running' || simState === 'deploying') && (
            <div className="w-full h-full border border-cyan-500/30 bg-cyan-900/20 rounded-xl flex items-center justify-center text-cyan-400 animate-pulse font-mono text-xs md:text-sm py-4">
              <Activity className="mr-2 animate-spin" size={16} />
              {simState === 'compiling' ? 'Compiling AST...' : simState === 'deploying' ? 'Binding to Hardware...' : 'Executing Sandbox...'}
            </div>
          )}
          {simState === 'verified' && (
            <div className="w-full h-full border border-emerald-500/30 bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-400 font-mono text-xs md:text-sm py-4">
              <CheckCircle2 className="mr-2" size={16} /> Verification Complete
            </div>
          )}
          {simState === 'deployable' && (
            <GlassButton variant="depin" className="w-full h-full text-sm md:text-lg animate-pulse py-4" onClick={handleDePINDeploy}>
              <HardDrive className="mr-2" size={18} /> Bind to Hardware (DePIN)
            </GlassButton>
          )}
          {simState === 'deployed' && (
            <div className="w-full h-full border border-orange-500/50 bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-400 font-mono text-xs md:text-sm py-4 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
              <Radio className="mr-2 animate-pulse" size={16} /> Live on Network
            </div>
          )}
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 min-h-0 bg-black rounded-xl border border-white/10 p-3 md:p-4 font-mono text-[11px] md:text-[13px] overflow-y-auto shadow-inner flex flex-col relative">
        <div className="text-gray-600 mb-4 border-b border-white/5 pb-2 sticky top-0 bg-black z-10 pt-1">
          Nexus Virtual Machine v4.2.0 initialized. Ready for execution.
        </div>
        <div className="flex-1 space-y-2 pb-4">
          {logs.map((log, i) => (
            <div key={i} className={logColors[log.type] || 'text-gray-400'}>
              <span className="text-gray-700 select-none mr-2 md:mr-3">[{log.time}]</span>
              {log.msg}
            </div>
          ))}
          {(simState === 'compiling' || simState === 'running' || simState === 'deploying') && (
            <div className="text-cyan-600 animate-pulse flex items-center mt-2">
              <span className="w-2 h-4 bg-cyan-500 inline-block mr-2" /> Processing...
            </div>
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}