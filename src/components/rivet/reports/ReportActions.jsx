import React, { useState } from 'react';
export default function ReportActions({ data }) {
  const [message,setMessage]=useState('');
  const copy=async value=>{try{await navigator.clipboard.writeText(value);setMessage('Copied to clipboard.');}catch{setMessage('Clipboard unavailable; select and copy the citation below.');}};
  const download=(format)=>{const text=format==='json'?JSON.stringify(data.manifest):`${data.manifest.markdown}\n\n## Citation\n\n${data.citation}\n\n${window.location.href}\n`;const blob=new Blob([text],{type:format==='json'?'application/json':'text/markdown'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`rivet-${data.manifest.domain}-${data.report.snapshotHash.slice(0,12)}.${format==='json'?'json':'md'}`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  return <section className="space-y-3 rounded-xl border border-border bg-card p-4">
    <div className="flex flex-wrap gap-2">{[['Copy citation',()=>copy(data.citation)],['Copy report link',()=>copy(window.location.href)],['Download Markdown',()=>download('md')],['Download snapshot JSON',()=>download('json')]].map(([label,action])=><button key={label} type="button" onClick={action} className="rounded-full border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">{label}</button>)}</div>
    <p className="text-xs leading-relaxed break-all select-text">{data.citation}</p><p className="text-xs text-muted-foreground">The JSON download preserves the saved snapshot serialization for SHA-256 verification; Markdown is a presentation export. Links require sign-in and source access.</p>
    {message&&<p role="status" className="text-xs text-muted-foreground">{message}</p>}
  </section>;
}