import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { usePosts, useUpvote } from './usePosts';
import PostCard from './PostCard';
import PostDetailModal from './PostDetailModal';

export default function SearchResults({ query, currentUser, onViewProfile }) {
  const { data: posts = [] } = usePosts();
  const upvote = useUpvote();
  const [selectedPost, setSelectedPost] = useState(null);

  const results = posts.filter(p =>
    (p.title + p.content + p.author + (p.tags || []).join(' ')).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Search Results</h2>
        <p className="text-sm text-gray-500 mt-0.5">{results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"</p>
      </div>
      {results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e4e6eb] p-12 shadow-sm text-center">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No results found. Try a different search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(post => (
            <PostCard key={post.id} post={post} onUpvote={(p) => upvote.mutate({ id: p.id, upvotes: p.upvotes })} onClick={setSelectedPost} onViewProfile={onViewProfile} />
          ))}
        </div>
      )}
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} currentUser={currentUser} onViewProfile={onViewProfile} />}
    </div>
  );
}