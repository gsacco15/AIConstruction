import React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  className?: string;
}

export default function FeatureCard({
  title,
  description,
  className = "",
}: FeatureCardProps) {
  return (
    <div
      className={`bg-white border flex grow flex-col justify-between text-[rgba(102,102,102,1)] w-full p-[22px] rounded-[15px] border-[rgba(230,230,230,1)] border-solid h-auto min-h-[180px] text-left font-['Inter'] transition-all duration-300 hover:shadow-lg hover:border-[rgba(151,71,255,0.3)] hover:-translate-y-1 hover:scale-[1.02] cursor-pointer relative group ${className}`}
    >
      {/* Arrow icon in top right corner with hover effect */}
      <div className="absolute top-4 right-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 text-[#666666] group-hover:text-[rgba(151,71,255,1)]">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="27" 
          height="27" 
          viewBox="0 0 27 27" 
          fill="none" 
          className="transition-all duration-300"
          stroke="currentColor"
        >
          <path 
            d="M8.96072 18.1289L18.1288 8.96077M18.1288 8.96077H11.2527M18.1288 8.96077V15.8368" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <circle 
            cx="13.5" 
            cy="13.5" 
            r="13" 
          />
        </svg>
      </div>
      
      <div className="pt-2 pr-7">
        <h3 className="text-xl md:text-2xl font-medium tracking-[-1.2px] text-left mb-3 transition-colors duration-300 group-hover:text-[rgba(151,71,255,1)]">{title}</h3>
        <p className="text-base font-normal tracking-[-0.5px] text-left text-[rgba(102,102,102,1)]">
          {description}
        </p>
      </div>
    </div>
  );
} 