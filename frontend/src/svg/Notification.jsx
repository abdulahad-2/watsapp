export default function NotificationIcon({ className }) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      height={48} 
      width={48} 
      preserveAspectRatio="xMidYMid meet" 
      version="1.1" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        className={className} 
        d="M24 4C22 4 20 5 20 7v1c-6 2-10 8-10 15v8l-2 2v2h28v-2l-2-2v-8c0-7-4-13-10-15V7c0-2-2-3-4-3zm-4 36c0 2 2 4 4 4s4-2 4-4h-8z" 
      />
    </svg>
  );
}
