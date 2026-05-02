import React from 'react';

export default function ConcentricLogo({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  );
}