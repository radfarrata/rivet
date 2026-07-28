import React from 'react';
import { X, Check, Bell } from 'lucide-react';

const NOTIFICATIONS = [
  { id: 1, icon: '👏', title: 'Sarah endorsed you', message: 'TechLead_Sarah endorsed your node', time: '10m ago', read: false },
  { id: 2, icon: '💰', title: 'Payment received', message: '+$500 USD for N-Body Sim Fix', time: '2h ago', read: false },
  { id: 3, icon: '💬', title: 'New comment', message: 'Backend_Bob commented on your task', time: '5h ago', read: false },
  { id: 4, icon: '🤖', title: 'AI Agent deployed', message: 'An agent is resolving your request', time: '1d ago', read: true },
  { id: 5, icon: '✅', title: 'Task approved', message: 'Your training task was approved (+120 pts)', time: '2d ago', read: true },
];

export default function NotificationsPanel({ onClose }) {
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute top-16 right-4 md:right-6 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-bold">{unreadCount} new</span>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {NOTIFICATIONS.map(n => (
            <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-violet-50/40' : ''}`}>
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base flex-shrink-0">{n.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-xs text-gray-500 truncate">{n.message}</p>
                <p className="text-[10px]! text-gray-400 mt-0.5">{n.time}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
        <div className="px-4 py-2.5 border-t border-gray-100">
          <button className="w-full text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors flex items-center justify-center gap-1.5">
            <Check size={14} /> Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
}