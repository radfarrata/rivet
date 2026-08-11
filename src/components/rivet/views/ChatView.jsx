import React, { useState, useEffect, useRef } from 'react';
import { Hash, Send } from 'lucide-react';
import { useChannelMessages, useSendMessage } from '../useChat';

const CHANNELS = [
  { id: 'general', label: 'general', desc: 'General community discussion' },
  { id: 'build', label: 'build', desc: 'Building & shipping products' },
  { id: 'training', label: 'training', desc: 'AI training & RLHF' },
  { id: 'agents', label: 'agents', desc: 'Autonomous agents & swarms' },
  { id: 'random', label: 'random', desc: 'Off-topic & watercooler' },
];

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatView({ currentUser }) {
  const [channelId, setChannelId] = useState('general');
  const [text, setText] = useState('');
  const { data: messages = [] } = useChannelMessages(channelId);
  const sendMessage = useSendMessage();
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, channelId]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage.mutate({
      channelId,
      authorName: currentUser?.full_name || 'You',
      text: text.trim(),
    });
    setText('');
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      <div className="w-56 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-3 overflow-y-auto">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Channels</h3>
        <div className="space-y-0.5">
          {CHANNELS.map(c => (
            <button key={c.id} onClick={() => setChannelId(c.id)} className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${channelId === c.id ? 'bg-violet-100 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Hash size={16} className="flex-shrink-0" /> {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Hash size={18} className="text-gray-400" />
            <h2 className="text-base font-bold text-gray-900">{channelId}</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{CHANNELS.find(c => c.id === channelId)?.desc}</p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">No messages yet. Start the conversation!</div>
          ) : messages.map(m => {
            const isMe = m.authorName === (currentUser?.full_name || 'You');
            return (
              <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">{(m.authorName || '??').slice(0, 2).toUpperCase()}</div>
                <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-900">{isMe ? 'You' : m.authorName}</span>
                    <span className="text-[10px] text-gray-400">{formatTime(m.created_date)}</span>
                  </div>
                  <div className={`rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${isMe ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{m.text}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder={`Message #${channelId}`} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
            <button onClick={handleSend} disabled={!text.trim() || sendMessage.isPending} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors"><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}