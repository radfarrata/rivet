import { useId } from 'react';

export function RivetIcon({ size = 32, className = "" }) {
  const uid = useId().replace(/:/g, '');
  const bodyGrad = `rivetBody-${uid}`;
  const shineGrad = `rivetShine-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={bodyGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5f5f8" />
          <stop offset="45%" stopColor="#b0b3c0" />
          <stop offset="100%" stopColor="#5a5d6e" />
        </linearGradient>
        <radialGradient id={shineGrad} cx="35%" cy="25%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="#2a2d3a" />
      <circle cx="24" cy="24" r="21.5" fill={`url(#${bodyGrad})`} />
      <circle cx="24" cy="24" r="15" fill="#3a3d4e" stroke="#2a2d3a" strokeWidth="0.5" />
      <g stroke="#6a6d7e" strokeWidth="2" strokeLinecap="round">
        <line x1="24" y1="11" x2="24" y2="37" />
        <line x1="11" y1="24" x2="37" y2="24" />
        <line x1="15" y1="15" x2="33" y2="33" />
        <line x1="33" y1="15" x2="15" y2="33" />
      </g>
      <circle cx="24" cy="24" r="5" fill="#4a4d5e" stroke="#2a2d3a" strokeWidth="0.5" />
      <circle cx="24" cy="24" r="2" fill="#6a6d7e" />
      <circle cx="24" cy="24" r="21.5" fill={`url(#${shineGrad})`} />
    </svg>
  );
}

export default RivetIcon;