import React, { useState } from 'react';
import { Calendar, MessageSquare, Users, Check } from 'lucide-react';
import PostCard from '../PostCard';
import PostDetailModal from '../PostDetailModal';
import { usePosts, useUpvote } from '../usePosts';
import { useEvents, useRSVP } from '../useEvents';

function EventsView({ currentUser }) {
  const { data: events = [], isLoading } = useEvents();
  const rsvp = useRSVP();

  const handleRSVP = (ev) => {
    if (!currentUser?.id) return;
    rsvp.mutate({ eventId: ev.id, userId: currentUser.id, currentRsvps: ev.rsvpUserIds });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Events</h2>
        <p className="text-sm text-gray-500 mt-0.5">Upcoming community events and hackathons</p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No events scheduled yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(ev => {
            const isGoing = (ev.rsvpUserIds || []).includes(currentUser?.id);
            const attendeeCount = (ev.baseAttendees || 0) + (ev.rsvpUserIds || []).length;
            return (
              <div key={ev.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-violet-100 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-violet-600">{ev.date.split(' ')[0]}</span>
                  <span className="text-lg font-bold text-violet-700">{ev.date.split(' ')[1]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900">{ev.title}</h3>
                  {ev.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ev.description}</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {ev.time}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {attendeeCount} attending</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">{ev.type}</span>
                  <button
                    onClick={() => handleRSVP(ev)}
                    disabled={rsvp.isPending}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${isGoing ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
                  >
                    {isGoing ? (<span className="flex items-center gap-1"><Check size={12} /> Going</span>) : 'RSVP'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
  const filtered = filter === 'open' ? discussions.filter(p => p.status === 'open') : discussions;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Discussions</h2>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} active discussions</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[{ id: 'all', label: 'All' }, { id: 'open', label: 'Open' }].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filter === f.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>{f.label}</button>
          ))}
        </div>
      </div>
      {isLoading ? (
        [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />)
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No discussions yet. Start one from the Feed!</p>
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