export function RivetIcon({ size = 32, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Head dome */}
      <path d="M14 20 C14 11 34 11 34 20 L34 29 L14 29 Z" fill="#ffffff" />
      {/* Panel seams */}
      <g stroke="#6a3a5a" strokeWidth="1.6" strokeLinecap="round">
        <line x1="19.3" y1="11.5" x2="19.3" y2="29" />
        <line x1="24" y1="10.5" x2="24" y2="29" />
        <line x1="28.7" y1="11.5" x2="28.7" y2="29" />
      </g>
      {/* Eyes */}
      <rect x="20.8" y="17" width="2.4" height="5" rx="1.2" fill="#6a3a5a" />
      <rect x="24.8" y="17" width="2.4" height="5" rx="1.2" fill="#6a3a5a" />
      {/* Tentacles */}
      <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M17 29 C16 34 15 37 15.5 41" />
        <path d="M21 29 C20.5 34 20 37 21 41" />
        <path d="M27 29 C27.5 34 28 37 27 41" />
        <path d="M31 29 C32 34 33 37 32.5 41" />
      </g>
      {/* Terminals */}
      <g fill="#ffffff">
        <circle cx="15.5" cy="41.5" r="2" />
        <circle cx="21" cy="41.5" r="2" />
        <circle cx="27" cy="41.5" r="2" />
        <circle cx="32.5" cy="41.5" r="2" />
      </g>
    </svg>
  );
}

export default RivetIcon;