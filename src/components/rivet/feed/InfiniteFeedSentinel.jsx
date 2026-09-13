import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
export default function InfiniteFeedSentinel({ hasNextPage, isFetchingNextPage, fetchNextPage }) {
  const ref=useRef(null);
  useEffect(()=>{if(!hasNextPage)return;const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!isFetchingNextPage)fetchNextPage();},{rootMargin:'500px'});if(ref.current)observer.observe(ref.current);return()=>observer.disconnect();},[hasNextPage,isFetchingNextPage,fetchNextPage]);
  if(!hasNextPage)return <p className="py-6 text-center text-xs text-[#71767b]">You’re all caught up.</p>;
  return <div ref={ref} role="status" className="flex h-16 items-center justify-center text-[#71767b]">{isFetchingNextPage&&<Loader2 size={18} className="animate-spin"/>}</div>;
}