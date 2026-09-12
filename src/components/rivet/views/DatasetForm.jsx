import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Icon from '@/components/Icon';
import { base44 } from '@/api/base44Client';
import { DOMAINS } from '../evalModels';
import { useCreateDataset } from '../useDatasets';

const inputCls = 'w-full bg-black border border-[#2f3336] focus:border-[#b06d97] rounded-lg px-3 py-2 text-sm text-white placeholder-[#71767b] focus:outline-none';

export default function DatasetForm({ onDone }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('biology');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const create = useCreateDataset();

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setUploading(true); setError('');
    try {
      let fileUri = '';
      if (file) ({ file_uri: fileUri } = await base44.integrations.Core.UploadPrivateFile({ file }));
      await create.mutateAsync({ name: name.trim(), description, domain, fileUri, fileName: file?.name || '', sizeBytes: file?.size || 0 });
      onDone?.();
    } catch (err) { setError(err.message || 'Dataset could not be saved.'); }
    finally { setUploading(false); }
  };

  return (
    <form onSubmit={submit} className="bg-[#16181c] border border-[#2f3336] rounded-2xl p-4 space-y-3">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Dataset name" className={inputCls} />
      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="What does this dataset contain?" className={`${inputCls} resize-none`} />
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={domain} onChange={e => setDomain(e.target.value)} className={inputCls}>
          {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
        <label className={`${inputCls} flex items-center gap-2 cursor-pointer text-[#71767b] truncate`}>
          <Icon name="upload" size={13} /> {file ? file.name : 'Attach CSV / JSON / PDF'}
          <input type="file" accept=".csv,.json,.xlsx,.pdf,.txt" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">New files are stored privately. Historical public uploads require separate removal from public storage.</p>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="px-4 py-1.5 rounded-full text-[13px] text-[#e7e9ea] hover:bg-white/5">Cancel</button>
        <button type="submit" disabled={uploading || !name.trim()} className="flex items-center gap-2 bg-[#653653] hover:bg-[#7c4165] disabled:opacity-40 text-white px-4 py-1.5 rounded-full text-[13px] font-bold">
          {uploading && <Loader2 size={14} className="animate-spin" />} Save dataset
        </button>
      </div>
    </form>
  );
}