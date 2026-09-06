import React from 'react';
import { CalendarDays, Flame } from 'lucide-react';
import { BalanceCard, TodayActivity } from './BalanceCard';
import TopContributors from './TopContributors';
import { useEvents } from './useEvents';
import { usePosts } from './usePosts';

export default function HomeRightRail({ currentUser, onViewProfile, onOpenPost }) {
  const { data: events = [] } = useEvents();
  const { data: posts = [] } = usePosts();
  const upcoming = events.slice(0, 3);
  const bounties = posts
    .filter(p => p.postType === 'task' && p.bounty > 0 && p.status !== 'resolved')
    .sort((a, b) => b.bounty - a.bounty)
    .slice(0, 3);

  return (
    <aside className="w-[300px] flex-shrink-0 hidden lg:flex flex-col gap-5 sticky top-0 self-start">
      <BalanceCard userId={currentUser?.id} />
      <TodayActivity />
      <TopContributors onViewProfile={onViewProfile} />

      <div className="bg-white rounded-2xl border border-[#e4e6eb] p-4 shadow-sm">
        <h3 className="text-sm font-bold text-[#050505] mb-3 flex items-center gap-2">
          <Flame size={15} className="text-[#653653]" /> Trending Bounties
        </h3>
        <div className="space-y-1">
          {bounties.length === 0 && <p className="text-xs text-[#65676b]">No open bounties right now.</p>}
          {bounties.map(p => (
            <div
              key={p.id}
              onClick={() => onOpenPost?.(p)}
              className="flex items-center justify-between gap-2 cursor-pointer rounded-lg p-1.5 hover:bg-[#f2e7ef] transition-colors"
            >
              <p className="text-xs font-semibold text-[#050505] truncate">{p.title}</p>
              <span className="text-xs font-bold text-[#653653] flex-shrink-0">${p.bounty}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e4e6eb] p-4 shadow-sm">
        <h3 className="text-sm font-bold text-[#050505] mb-3 flex items-center gap-2">
          <CalendarDays size={15} className="text-[#653653]" /> Upcoming Events
        </h3>
        <div className="space-y-3">
          {upcoming.length === 0 && <p className="text-xs text-[#65676b]">No events scheduled.</p>}
          {upcoming.map(ev => {
            const [month, day] = (ev.date || '').split(' ');
            return (
              <div key={ev.id} className="flex gap-3 items-center">
                <div className="w-10 h-11 rounded-lg bg-[#f2e7ef] text-[#653653] flex flex-col items-center justify-center flex-shrink-0 border border-[#653653]/10">
                  <span className="text-[9px] font-bold uppercase leading-none">{month}</span>
                  <span className="text-sm font-bold leading-tight">{day}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#050505] truncate">{ev.title}</p>
                  <p className="text-[11px] text-[#65676b]">{ev.time} • {ev.type}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}