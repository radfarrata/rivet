import React from 'react';
export default function FeedSkeleton({ count=4 }) {
  return <div aria-label="Loading feed" role="status">{Array.from({length:count},(_,i)=><div key={i} className="flex gap-3 border-b border-[#2f3336] px-4 py-4 animate-pulse">
    <div className="h-10 w-10 shrink-0 rounded-full bg-[#202327]"/><div className="flex-1 space-y-3"><div className="h-3 w-2/5 rounded bg-[#202327]"/><div className="h-3 w-full rounded bg-[#202327]"/><div className="h-3 w-4/5 rounded bg-[#202327]"/><div className="flex gap-8 pt-2">{Array.from({length:4},(_,j)=><div key={j} className="h-3 w-8 rounded bg-[#202327]"/>)}</div></div>
  </div>)}</div>;
}