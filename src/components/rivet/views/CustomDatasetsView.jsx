import React, { useState } from 'react';
import Icon from '@/components/Icon';
import { useDatasets, useDeleteDataset } from '../useDatasets';
import { domainLabel } from '../evalModels';
import DatasetForm from './DatasetForm';

const fmtSize = (b) => (!b ? '—' : b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);

export default function CustomDatasetsView() {
  const { data: datasets = [], isLoading } = useDatasets();
  const remove = useDeleteDataset();
  const [adding, setAdding] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Icon name="database" size={17} className="text-[#b06d97]" /> Custom Datasets</h1>
          <p className="text-[13px] text-[#71767b] mt-1">Upload your own data to build evaluation tasks from.</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-[#653653] hover:bg-[#7c4165] text-white px-4 py-2 rounded-full text-[13px] font-bold">
            <Icon name="plus" size={13} /> New dataset
          </button>
        )}
      </div>

      {adding && <DatasetForm onDone={() => setAdding(false)} />}

      <div className="rounded-2xl border border-[#2f3336] bg-[#16181c] overflow-hidden">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-[#71767b]">Loading…</p>
        ) : datasets.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#71767b]">No datasets yet — add one to get started.</p>
        ) : datasets.map(d => (
          <div key={d.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#2f3336] last:border-b-0">
            <span className="w-9 h-9 rounded-lg bg-[#2f3336] text-[#e7e9ea] flex items-center justify-center flex-shrink-0"><Icon name="file" size={15} /></span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{d.name}</p>
              <p className="text-[11px] text-[#71767b] truncate">{domainLabel(d.domain)} · {d.fileName || 'No file'} · {fmtSize(d.sizeBytes)}{d.description ? ` · ${d.description}` : ''}</p>
            </div>
            {d.fileUrl && <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-[11px] text-[#b06d97] hover:underline">Open</a>}
            <button onClick={() => remove.mutate(d.id)} className="p-2 rounded-full text-[#71767b] hover:text-[#ff6b6b] hover:bg-white/5"><Icon name="trash" size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}