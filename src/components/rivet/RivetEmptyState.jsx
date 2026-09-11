import React from 'react';
import { RivetGlyph } from './RivetLogo';

/** Shared empty / loading block — the Rivet glyph sits above the message on every tab. */
export default function RivetEmptyState({ title, description, action, loading = false, size = 76 }) {
  return (
    <div className="py-14 px-6 flex flex-col items-center text-center">
      <RivetGlyph size={size} spin={loading} className={loading ? 'opacity-25' : 'opacity-[0.14]'} />
      <p className="text-[15px] font-semibold text-white mt-4">{title}</p>
      {description && <p className="text-[13px] text-[#71767b] mt-1 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}