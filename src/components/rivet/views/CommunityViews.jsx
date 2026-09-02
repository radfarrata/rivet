import React, { useState } from 'react';
import { Calendar, MessageSquare, Users, Check, Plus } from 'lucide-react';
import PostCard from '../PostCard';
import PostDetailModal from '../PostDetailModal';
import CreateEventModal from '../CreateEventModal';
import { usePosts, useUpvote } from '../usePosts';
import { useEvents, useRSVP } from '../useEvents';

const DISCUSSION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'resolved', label: 'Resolved' },
];

function EventsView({ currentUser }) {
  const { data: events = [], isLoading } = useEvents();
  const rsvp = useRSVP();
  const [showCreate, setShowCreate] = useState(false);

  const handleRSVP = (ev) => {
    if (!currentUser?.id) return;
    rsvp.mutate({ eventId: ev.id, userId: currentUser.id, currentRsvps: ev.rsvpUserIds });
  };

  const sortedEvents = [...events].sort((a, b) => {
    const aGoing = (a.rsvpUserIds || []).includes(currentUser?.id);
    const bGoing = (b.rsvpUserIds || []).includes(currentUser?.id);
    if (aGoing && !bGoing) return -1;
    if (!aGoing && bGoing) return 1;
    return 0;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e7e9ea]">Events</h2>
          <p className="text-sm text-[#71767b] mt-0.5">{events.length} upcoming community events and hackathons</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-[#6a3a5a] hover:bg-[#7d4a6a] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"><Plus size={16} /> New Event</button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[#16181c] rounded-2xl border border-[#2f3336] animate-pulse" />)}</div>
      ) : events.length === 0 ? (
        <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] p-12 text-center">
          <Calendar className="w-10 h-10 text-[#4a4a4a] mx-auto mb-3" />
          <p className="text-[#71767b] text-sm">No events scheduled yet. Create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedEvents.map(ev => {
            const isGoing = (ev.rsvpUserIds || []).includes(currentUser?.id);
            const attendeeCount = (ev.baseAttendees || 0) + (ev.rsvpUserIds || []).length;
            return (
              <div key={ev.id} className={`bg-[#16181c] rounded-2xl border p-5 flex items-center gap-4 hover:bg-[#1c1f23] transition-colors ${isGoing ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-[#2f3336]'}`}>
                <div className="w-14 h-14 rounded-xl bg-[#9d4f7a]/15 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#9d4f7a]">{(ev.date || '').split(' ')[0]}</span>
                  <span className="text-lg font-bold text-[#e7a9c8]">{(ev.date || '').split(' ')[1]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#e7e9ea]">{ev.title}</h3>
                  {ev.description && <p className="text-xs text-[#71767b] mt-0.5 line-clamp-1">{ev.description}</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#71767b]">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {ev.time}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {attendeeCount} attending</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-[#71767b] font-medium">{ev.type}</span>
                  <button onClick={() => handleRSVP(ev)} disabled={rsvp.isPending} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${isGoing ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-[#6a3a5a] text-white hover:bg-[#7d4a6a]'}`}>
                    {isGoing ? (<span className="flex items-center gap-1"><Check size={12} /> Going</span>) : 'RSVP'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

export default function CommunityViews({ mode = 'discussions', currentUser, onViewProfile }) {
  const { data: posts = [], isLoading } = usePosts();
  const upvote = useUpvote();
  const [filter, setFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);

  if (mode === 'events') {
    return <EventsView currentUser={currentUser} />;
  }

  const discussions = posts.filter(p => p.postType === 'discussion');
  const filtered = filter === 'all' ? discussions : discussions.filter(p => p.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#e7e9ea]">Discussions</h2>
          <p className="text-sm text-[#71767b] mt-0.5">{filtered.length} active discussions</p>
        </div>
        <div className="flex gap-1 bg-[#16181c] border border-[#2f3336] p-1 rounded-lg">
          {DISCUSSION_FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filter === f.id ? 'bg-[#9d4f7a] text-white' : 'text-[#71767b] hover:text-[#e7e9ea]'}`}>{f.label}</button>
          ))}
        </div>
      </div>
      {isLoading ? (
        [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-[#16181c] rounded-2xl border border-[#2f3336] animate-pulse" />)
      ) : filtered.length === 0 ? (
        <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] p-12 text-center">
          <MessageSquare className="w-10 h-10 text-[#4a4a4a] mx-auto mb-3" />
          <p className="text-[#71767b] text-sm">No discussions yet. Start one from the Feed!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} onUpvote={(p) => upvote.mutate({ id: p.id, upvotes: p.upvotes })} onClick={setSelectedPost} onViewProfile={onViewProfile} />
          ))}
        </div>
      )}
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} currentUser={currentUser} onViewProfile={onViewProfile} />}
    </div>
  );
}