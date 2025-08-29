import React from 'react';

/**
 * ReturnIcon — fixed & valid JSX version.
 * Keeps className and size props so it behaves like other icons.
 */
export default function ReturnIcon({ className, size = 24 }) {
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
      {/* simple return/undo arrow */}
      <path
        d="M20 11a8 8 0 10-8 8v-2.2a6 6 0 116-6h-4l3 3-3 3h4z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
