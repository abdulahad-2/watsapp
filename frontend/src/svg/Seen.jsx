import React from 'react';

/**
 * SeenIcon
 * Simple, valid JSX double-check icon. Uses currentColor so you can control color via CSS.
 * Keeps default size 18 to match your previous components.
 */
export default function SeenIcon({ className, size = 18 }) {
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
      {/* first (smaller) check */}
      <path
        d="M2.5 13.5l4 4L11 13"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
      {/* second (primary) check */}
      <path
        d="M9 13.5l3.5 3.5L21.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
