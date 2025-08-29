import React from 'react';

export default function FileIcon({ className, width = 88, height = 110 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 88 110"
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <path
          id="a"
          d="M3 0h56.928a5 5 0 0 1 3.536 1.464l15.072 15.072A5 5 0 0 1 80 20.07V101a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3z"
        />
      </defs>
      <g transform="translate(4 3)" fill="none" fillRule="evenodd">
        <use fill="#000" xlinkHref="#a" />
        <use fill="#FFF" xlinkHref="#a" />
        <path
          strokeOpacity="0.08"
          stroke="#000"
          d="M3-.5h56.929a5.5 5.5 0 0 1 3.889 1.61l15.071 15.072a5.5 5.5 0 0 1 1.611 3.89V101a3.5 3.5 0 0 1-3.5 3.5H3A3.5 3.5 0 0 1-.5 101V3A3.5 3.5 0 0 1 3-.5z"
          fill="url(#linearGradient-1)"
        />
        {/* Lines inside the file */}
        {[28, 33, 38, 43, 53, 58, 63, 68, 73, 78].map((y, i) => (
          <rect key={i} x={13} y={y} width={i === 9 ? 27 : 52} height={2} rx="0.5" fill="#000" fillOpacity="0.2" />
        ))}
        <path d="M61.5.5v15a3 3 0 0 0 3 3h15" strokeOpacity="0.12" stroke="#000" fill="#FFF" />
      </g>
    </svg>
  );
}
