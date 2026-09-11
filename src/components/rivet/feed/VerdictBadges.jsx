import React from 'react';
import Icon from '@/components/Icon';

/** Signal badges that explain why a verdict is interesting. */
export default function VerdictBadges({ verdict }) {
  const items = [];
  if (verdict.overruled) items.push({ icon: 'shield', label: 'Humans overruled the judge', cls: 'bg-[#ff6b6b]/15 text-[#ff6b6b]' });
  if (verdict.upset) items.push({ icon: 'trending', label: 'Underdog win', cls: 'bg-[#2fd4a7]/15 text-[#2fd4a7]' });
  if (verdict.spread >= 25) items.push({ icon: 'alert', label: `Wide split · ${verdict.spread} pts`, cls: 'bg-[#f5b544]/15 text-[#f5b544]' });
  if (verdict.margin !== null && verdict.margin <= 2) items.push({ icon: 'layers', label: 'Too close to call', cls: 'bg-[#4f8cff]/15 text-[#4f8cff]' });
  if (!items.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
      {items.map(({ icon, label, cls }) => (
        <span key={label} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${cls}`}>
          <Icon name={icon} size={9} /> {label}
        </span>
      ))}
    </div>
  );
}