import React from 'react';

export default function SearchIcon({ className, size = 24 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      role="img"
    >
      {/* Simple magnifier icon (valid JSX) */}
      <circle cx={11} cy={11} r={7} fill="none" stroke="currentColor" strokeWidth={1.6} />
      <line x1={21} y1={21} x2={16.65} y2={16.65} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}
