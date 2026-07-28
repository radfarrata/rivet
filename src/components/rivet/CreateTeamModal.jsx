import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CreateTeamModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({ name, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Create New Team</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Team Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Frontend Wizards" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What will this team work on?" rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none" />
          </div>
          <button onClick={handleCreate} disabled={!name.trim()} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">Create Team</button>
        </div>
      </div>
    </div>
  );
}