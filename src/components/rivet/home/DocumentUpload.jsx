import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2, FileCheck2 } from 'lucide-react';

// Uploads a document and pulls its key content into the task prompt.
export default function DocumentUpload({ onExtracted }) {
  const [state, setState] = useState({ status: 'idle', name: '', error: '' });

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setState({ status: 'working', name: file.name, error: '' });
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      const res = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            summary: { type: 'string' },
            key_content: { type: 'string' },
          },
        },
      });
      if (res.status !== 'success') throw new Error(res.details || 'Could not read that document');
      const out = res.output || {};
      onExtracted({
        title: out.title || file.name,
        prompt: `Based on the document "${out.title || file.name}":\n\n${out.key_content || out.summary || ''}\n\nQuestion: `,
        fileUrl: file_url,
      });
      setState({ status: 'done', name: file.name, error: '' });
    } catch (err) {
      setState({ status: 'idle', name: file.name, error: err.message || 'Upload failed' });
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center justify-center gap-2 py-6 rounded-xl border border-dashed border-[#2a2e3d] bg-[#0e1017] cursor-pointer hover:border-[#653653]/60 transition-colors text-sm text-[#8b90a0]">
        {state.status === 'working' ? <><Loader2 size={16} className="animate-spin text-[#b06d97]" /> Reading {state.name}…</>
          : state.status === 'done' ? <><FileCheck2 size={16} className="text-[#2fd4a7]" /> {state.name} added to the task</>
          : <><Upload size={16} /> Upload a PDF, spreadsheet or image to build a task from</>}
        <input type="file" accept=".pdf,.csv,.xlsx,.json,.html,.png,.jpg,.jpeg" className="hidden" onChange={handleFile} disabled={state.status === 'working'} />
      </label>
      {state.error && <p className="text-[11px] text-[#ff6b6b]">{state.error}</p>}
    </div>
  );
}