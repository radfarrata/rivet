import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
export default function DatasetDownload({ dataset }) {
  const [url, setUrl] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const prepare = async () => {
    setBusy(true); setError('');
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: dataset.fileUri, expires_in: 60 }); setUrl(signed_url);
    } catch { setError('You cannot access this file or the download could not be prepared.'); }
    finally { setBusy(false); }
  };
  if (!dataset.fileUri) return dataset.fileUrl?.startsWith('https://') ? <span className="text-xs text-muted-foreground"><a href={dataset.fileUrl} target="_blank" rel="noreferrer" className="underline">Open legacy file</a><span className="block">Previously uploaded publicly</span></span> : null;
  return <span className="flex flex-col gap-1 text-xs">{url ? <a href={url} target="_blank" rel="noreferrer" className="underline">Download (expires in 60s)</a> : <button disabled={busy} onClick={prepare} className="underline">{busy ? 'Preparing…' : 'Prepare private download'}</button>}{url && <button onClick={prepare} disabled={busy} className="underline">Refresh link</button>}{error && <span role="alert" className="text-destructive">{error}</span>}</span>;
}