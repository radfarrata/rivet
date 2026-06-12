import React from 'react';
import { Check, Bell, ShieldAlert } from 'lucide-react';

export default function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="animate-in slide-in-from-right-8 fade-in duration-300 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 shadow-2xl rounded-xl p-4 flex items-center gap-3 w-72 pointer-events-auto">
          <div className={`p-2 rounded-full ${t.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : t.type === 'info' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {t.type === 'success' ? <Check size={16}/> : t.type === 'info' ? <Bell size={16}/> : <ShieldAlert size={16}/>}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white">{t.title}</h4>
            <p className="text-xs text-zinc-400">{t.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}