import React from 'react';

export default function StoryIcon({ className, active }) {
  if (active) {
    return (
      <svg 
        viewBox="0 0 24 24" 
        height={24} 
        width={24} 
        preserveAspectRatio="xMidYMid meet" 
        version="1.1" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" fill="#009588" />
        <circle cx="12" cy="12" r="7" fill="white" />
        <circle cx="12" cy="12" r="5" fill="#009588" className={className} />
      </svg>
    );
  } else {
    return (
      <svg 
        viewBox="0 0 24 24" 
        height={24} 
        width={24} 
        preserveAspectRatio="xMidYMid meet" 
        version="1.1" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" stroke="#ddd" strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="5" fill="#ddd" className={className} />
      </svg>
    );
  }
}
