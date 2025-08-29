import React from 'react';

export default function ChatIcon({ className, size = 24 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Clean, valid chat bubble SVG */}
      <path
        d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12l4 4V4c0-1.1-.9-2-2-2z"
        fill="#fff"
        stroke="#3762ea"
        strokeWidth={0.8}
      />
      <circle cx={8} cy={10} r={1.2} fill="#3762ea" />
      <circle cx={12} cy={10} r={1.2} fill="#3762ea" />
      <circle cx={16} cy={10} r={1.2} fill="#3762ea" />
    </svg>
  );
}
