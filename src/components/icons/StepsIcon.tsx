
import React from "react";

export const StepsIcon = ({ className, size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <path d="M4 20h16M4 14h7M4 8h2M11 4h6M11 12h8M18 8h2" />
    </svg>
  );
};

export default StepsIcon;
