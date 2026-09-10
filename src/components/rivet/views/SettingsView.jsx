import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Settings, Loader2, Check, LogOut } from 'lucide-react';
import { DOMAINS } from '../evalModels';

const inputCls = 'w-full bg-[#0e1017] border border-[#1f232e] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#6b7080] focus:outline-none focus:border-[#653653]/60';

export default function SettingsView({ currentUser }) {
  const [headline, setHeadline] = useState(currentUser?.headline || '');
  const [expertise, setExpertise] = useState(currentUser?.expertise || '');
  const [defaultDomain, setDefaultDomain] = useState(currentUser?.defaultDomain || 'biology');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await base44.auth.updateMe({ headline, expertise, defaultDomain });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={18} className="text-[#b06d97]" /> Settings</h1>
        <p className="text-[13px] text-[#8b90a0] mt-1">Your profile details and evaluation preferences.</p>
      </div>

      <div className="rounded-2xl border border-[#1f232e] bg-[#12141b] p-5 space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8b90a0] mb-1.5">Account</p>
          <p className="text-sm text-white font-semibold">{currentUser?.full_name}</p>
          <p className="text-xs text-[#6b7080]">{currentUser?.email}</p>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#8b90a0] mb-1.5">Headline</label>
          <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Student Researcher" className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#8b90a0] mb-1.5">Areas of expertise</label>
          <input value={expertise} onChange={e => setExpertise(e.target.value)} placeholder="e.g. molecular biology, statistics" className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#8b90a0] mb-1.5">Default domain</label>
          <select value={defaultDomain} onChange={e => setDefaultDomain(e.target.value)} className={inputCls}>
            {DOMAINS.map(d => <option key={d.id} value={d.id} className="bg-[#12141b]">{d.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-[#653653] hover:bg-[#7c4165] disabled:opacity-50 text-white px-5 py-2 rounded-full text-[13px] font-bold">
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null} {saved ? 'Saved' : 'Save changes'}
          </button>
          <button onClick={() => base44.auth.logout()} className="flex items-center gap-2 text-[13px] font-semibold text-[#8b90a0] hover:text-white">
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>
    </div>
  );
}