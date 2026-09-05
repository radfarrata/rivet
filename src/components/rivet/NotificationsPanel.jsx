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
      <div className="absolute top-16 right-4 md:right-6 w-80 bg-[#ffffff] rounded-2xl border border-[#e4e6eb] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e4e6eb]">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-[#65676b]" />
            <h3 className="text-sm font-bold text-[#050505]">Notifications</h3>
            {unread.length > 0 && <span className="text-[10px] bg-[#1877f2]/15 text-[#1877f2] px-1.5 py-0.5 rounded-full font-bold">{unread.length} new</span>}
          </div>
          <button onClick={onClose} className="text-[#65676b] hover:text-[#050505]"><X size={16} /></button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-[#65676b]">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#65676b]">No notifications yet.</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-[#e4e6eb] hover:bg-[#f0f2f5] transition-colors ${!n.read ? 'bg-[#1877f2]/10' : ''}`}>
                <div className="w-9 h-9 rounded-lg bg-[#f0f2f5] flex items-center justify-center text-base flex-shrink-0">{ICONS[n.type] || ICONS.default}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#050505]">{n.title}</p>
                  <p className="text-xs text-[#65676b]">{n.message}</p>
                  <p className="text-[10px] text-[#65676b] mt-0.5">{formatRelative(n.created_date)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-[#1877f2] flex-shrink-0 mt-1.5" />}
              </div>
            ))
          )}
        </div>
        {unread.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[#e4e6eb]">
            <button onClick={() => markAll.mutate(notifications)} disabled={markAll.isPending} className="w-full text-xs font-medium text-[#1877f2] hover:text-[#166fe5] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
              <Check size={14} /> Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
}