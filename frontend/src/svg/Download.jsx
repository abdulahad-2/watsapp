import React from 'react';

export default function DownloadIcon({ className, width = 34, height = 34 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 34 34"
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Example paths, replace 'M...' with actual path data */}
      <path fill="#8696A0" d="M17 0 L17 24" />  {/* arrow stem */}
      <path fill="#8696A0" d="M12 19 L17 24 L22 19" /> {/* arrow head */}
    </svg>
  );
}
