import React from 'react';
import ReactMarkdown from 'react-markdown';
export default function AuditAdvisorMessage({ message }) {
  const user=message.role==='user';
  return <div className={`flex ${user?'justify-end':'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${user?'bg-primary text-primary-foreground':'bg-[#16181c] border border-[#2f3336] text-[#e7e9ea]'}`}>{user?<p className="whitespace-pre-wrap">{message.content}</p>:<div className="prose prose-sm prose-invert max-w-none"><ReactMarkdown>{message.content}</ReactMarkdown></div>}{message.tool_calls?.map((tool,index)=><p key={index} className="mt-2 text-xs text-[#71767b]">{tool.display_projection?.label || 'Audit lookup'} · {tool.status}</p>)}</div></div>;
}