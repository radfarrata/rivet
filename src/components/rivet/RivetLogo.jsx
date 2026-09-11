import React from 'react';

export const RIVET_LOGO_URL = 'https://media.base44.com/images/public/69f641f65e271dbe71760592/65a9b2fff_M2.png';

/** The app mark — plum tile with the white Rivet creature. */
export function RivetMark({ size = 32, className = '', rounded = 'rounded-lg', glow = false }) {
  return (
    <img
      src={RIVET_LOGO_URL}
      alt="Rivet"
      width={size}
      height={size}
      className={`${rounded} object-cover flex-shrink-0 ${glow ? 'shadow-[0_0_20px_rgba(101,54,83,0.65)]' : ''} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Mark + uppercase wordmark, used in headers and auth screens. */
export function RivetWordmark({ size = 32, className = '', textClassName = 'text-white' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <RivetMark size={size} />
      <span className={`font-bold tracking-tight ${textClassName}`} style={{ fontSize: size * 0.62 }}>RIVET</span>
    </div>
  );
}

export const RivetIcon = RivetMark;
export default RivetMark;