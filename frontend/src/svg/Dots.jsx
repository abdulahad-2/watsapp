import React from 'react';

export default function DotsIcon({ className, width = 24, height = 24 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Example 3 dots icon, fill according to your class */}
      <circle className={className} cx="5" cy="12" r="2" />
      <circle className={className} cx="12" cy="12" r="2" />
      <circle className={className} cx="19" cy="12" r="2" />
    </svg>
  );
}
