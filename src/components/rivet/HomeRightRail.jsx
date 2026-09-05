import React from 'react';
import { CalendarDays } from 'lucide-react';
import { BalanceCard, TodayActivity } from './BalanceCard';
import TopContributors from './TopContributors';
import { useEvents } from './useEvents';

export default function HomeRightRail({ currentUser, onViewProfile }) {
  const { data: events = [] } = useEvents();
  const upcoming = events.slice(0, 3);

  return (
    <aside className="w-[300px] flex-shrink-0 hidden lg:flex flex-col gap-5 sticky top-0 self-start">
      <BalanceCard userId={currentUser?.id} />
      <TodayActivity />
      <TopContributors onViewProfile={onViewProfile} />

      <div className="bg-white rounded-2xl border border-[#e4e6eb] p-4 shadow-sm">
        <h3 className="text-sm font-bold text-[#050505] mb-3 flex items-center gap-2">
          <CalendarDays size={15} className="text-[#1877f2]" /> Upcoming Events
        </h3>
        <div className="space-y-3">
          {upcoming.length === 0 && <p className="text-xs text-[#65676b]">No events scheduled.</p>}
          {upcoming.map(ev => {
            const [month, day] = (ev.date || '').split(' ');
            return (
              <div key={ev.id} className="flex gap-3 items-center">
                <div className="w-10 h-11 rounded-lg bg-[#e7f3ff] text-[#1877f2] flex flex-col items-center justify-center flex-shrink-0 border border-[#1877f2]/10">
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