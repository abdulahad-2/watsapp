import React from 'react';

/**
 * FilterIcon — simple funnel/filter icon
 * Accepts className & size props
 */
export default function FilterIcon({ className, size = 20 }) {
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
      <path
        d="M3 4h18M6 12h12M10 20h4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
