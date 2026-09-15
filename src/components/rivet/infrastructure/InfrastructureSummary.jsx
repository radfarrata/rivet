import React from 'react';
import { Boxes, GitBranch, LockKeyhole, TestTube2 } from 'lucide-react';

export default function InfrastructureSummary({ data }) {
  const synced = data.versions.filter(item => item.repositoryMetadataSyncedAt).length;
  const cards = [[TestTube2, 'Active regression tests', data.tests.length], [GitBranch, 'Release decisions', data.releases.length], [Boxes, 'Versioned models', `${synced}/${data.versions.length} synced`], [LockKeyhole, 'Private workspaces', data.workspaces.length]];
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(([Icon, label, value]) => <div key={label} className="rounded-2xl border border-[#2f3336] bg-[#16181c] p-4"><Icon size={16} className="text-[#b06d97]" /><p className="mt-3 text-lg font-bold text-white">{value}</p><p className="text-[11px] text-[#71767b]">{label}</p></div>)}</div>;
}