export function RivetIcon({ size = 32, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Head dome */}
      <path d="M12 20 C12 8 36 8 36 20 L36 28 L12 28 Z" fill="#ffffff" />
      {/* X panel seams */}
      <g stroke="#653653" strokeWidth="1.8" strokeLinecap="round">
        <line x1="15" y1="10.5" x2="33" y2="19" />
        <line x1="33" y1="10.5" x2="15" y2="19" />
      </g>
      {/* Eyes */}
      <rect x="20.8" y="18" width="2.4" height="5" rx="1.2" fill="#653653" />
      <rect x="24.8" y="18" width="2.4" height="5" rx="1.2" fill="#653653" />
      {/* Circuit lines */}
      <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M15.5 28 C13.5 33 12.5 36 13 41" />
        <path d="M19.5 28 C18.5 33 18 36 18.5 41" />
        <path d="M28.5 28 C29.5 33 30 36 29.5 41" />
        <path d="M32.5 28 C34.5 33 35.5 36 35 41" />
      </g>
      {/* Terminal nodes */}
      <g fill="#ffffff">
        <circle cx="13" cy="41.5" r="2" />
        <circle cx="18.5" cy="41.5" r="2" />
        <circle cx="29.5" cy="41.5" r="2" />
        <circle cx="35" cy="41.5" r="2" />
      </g>
    </svg>
  );
}

export default RivetIcon;