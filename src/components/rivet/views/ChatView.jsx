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
      <div className="w-56 flex-shrink-0 bg-[#16181c] rounded-2xl border border-[#2f3336] p-3 overflow-y-auto">
        <h3 className="text-xs font-bold text-[#71767b] uppercase tracking-wider px-2 mb-2">Channels</h3>
        <div className="space-y-0.5">
          {CHANNELS.map(c => (
            <button key={c.id} onClick={() => setChannelId(c.id)} className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${channelId === c.id ? 'bg-[#9d4f7a]/15 text-[#9d4f7a] font-medium' : 'text-[#e7e9ea] hover:bg-white/5'}`}>
              <Hash size={16} className="flex-shrink-0" /> {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#16181c] rounded-2xl border border-[#2f3336] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2f3336]">
          <div className="flex items-center gap-2">
            <Hash size={18} className="text-[#71767b]" />
            <h2 className="text-base font-bold text-[#e7e9ea]">{channelId}</h2>
          </div>
          <p className="text-xs text-[#71767b] mt-0.5">{CHANNELS.find(c => c.id === channelId)?.desc}</p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-[#71767b]">No messages yet. Start the conversation!</div>
          ) : messages.map(m => {
            const isMe = m.authorName === (currentUser?.full_name || 'You');
            return (
              <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6a3a5a] to-[#9d4f7a] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">{(m.authorName || '??').slice(0, 2).toUpperCase()}</div>
                <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-[#e7e9ea]">{isMe ? 'You' : m.authorName}</span>
                    <span className="text-[10px] text-[#71767b]">{formatTime(m.created_date)}</span>
                  </div>
                  <div className={`rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${isMe ? 'bg-[#6a3a5a] text-white' : 'bg-white/5 text-[#e7e9ea]'}`}>{m.text}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-[#2f3336]">
          <div className="flex gap-2">
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder={`Message #${channelId}`} className="flex-1 bg-[#0d0d12] border border-[#2f3336] rounded-xl px-4 py-2.5 text-sm text-[#e7e9ea] placeholder-[#71767b] focus:outline-none focus:border-[#9d4f7a]" />
            <button onClick={handleSend} disabled={!text.trim() || sendMessage.isPending} className="bg-[#6a3a5a] hover:bg-[#7d4a6a] disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors"><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}