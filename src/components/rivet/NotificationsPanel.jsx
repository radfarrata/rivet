import React from 'react';
import { X, Bell, Check } from 'lucide-react';
import { useNotifications, useMarkAllNotificationsRead } from './useNotifications';

const ICONS = {
  claim: '🔔',
  task: '✅',
  comment: '💬',
  default: '🔔',
};

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const diffMin = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

export default function NotificationsPanel({ onClose }) {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const unread = notifications.filter(n => !n.read);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute top-16 right-4 md:right-6 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            {unread.length > 0 && <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-bold">{unread.length} new</span>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet.</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-violet-50/40' : ''}`}>
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base flex-shrink-0">{ICONS[n.type] || ICONS.default}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatRelative(n.created_date)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />}
              </div>
            ))
          )}
        </div>
        {unread.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100">
            <button onClick={() => markAll.mutate(notifications)} disabled={markAll.isPending} className="w-full text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
              <Check size={14} /> Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
}