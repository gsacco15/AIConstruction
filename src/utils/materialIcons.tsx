import React from 'react';

// Material category icons
export const MaterialIcon = ({ name, className = "h-6 w-6" }: { name: string, className?: string }) => {
  const lowercaseName = name.toLowerCase();
  
  // Tile related materials
  if (lowercaseName.includes('tile') || lowercaseName.includes('grout') || lowercaseName.includes('mortar')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="8" height="8" />
        <rect x="13" y="3" width="8" height="8" />
        <rect x="3" y="13" width="8" height="8" />
        <rect x="13" y="13" width="8" height="8" />
      </svg>
    );
  }
  
  // Paint related materials
  if (lowercaseName.includes('paint') || lowercaseName.includes('primer') || lowercaseName.includes('stain')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 11h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2" />
        <path d="M4 4h16v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V4z" />
        <path d="M4 4v16" />
      </svg>
    );
  }
  
  // Wood related materials
  if (lowercaseName.includes('wood') || lowercaseName.includes('lumber') || lowercaseName.includes('plywood')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 8h20M2 16h20M2 4h20v16H2z" />
        <path d="M6 4v16M10 4v16M14 4v16M18 4v16" />
      </svg>
    );
  }
  
  // Bathroom specific
  if (lowercaseName.includes('bathroom') || lowercaseName.includes('shower') || lowercaseName.includes('toilet')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18H4z" />
        <path d="M4 12h16M4 22h16M9 12v4M15 12v4" />
      </svg>
    );
  }
  
  // Default material icon
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
};

// Tool category icons
export const ToolIcon = ({ name, className = "h-6 w-6" }: { name: string, className?: string }) => {
  const lowercaseName = name.toLowerCase();
  
  // Cutting tools
  if (lowercaseName.includes('saw') || lowercaseName.includes('knife') || lowercaseName.includes('cutter')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2L16 3.5 7 12.5 2.5 8 3.5 6.5l4 4L14.5 2z" />
        <path d="M4 20l5-5" />
        <path d="M8.5 15.5L15 22" />
      </svg>
    );
  }
  
  // Hammers and mallets
  if (lowercaseName.includes('hammer') || lowercaseName.includes('mallet')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
        <path d="M17.64 15L22 10.64" />
        <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
      </svg>
    );
  }
  
  // Fasteners, screwdrivers
  if (lowercaseName.includes('screw') || lowercaseName.includes('driver') || lowercaseName.includes('drill')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    );
  }
  
  // Measuring tools
  if (lowercaseName.includes('measure') || lowercaseName.includes('level') || lowercaseName.includes('tape')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h20v7H2z" />
        <path d="M4 11v4h16v-4" />
        <path d="M8 11v2M12 11v2M16 11v2M6 15v5M18 15v5" />
      </svg>
    );
  }
  
  // Painting tools
  if (lowercaseName.includes('brush') || lowercaseName.includes('roller')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 5-5 5M2 12h15M19 19v-6l2-2" />
        <path d="M3 19v-7l10-10 6 6-10 10Z" />
      </svg>
    );
  }
  
  // Default tool icon
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
};

// Function to determine whether an item is a material or tool and return appropriate icon
export const getItemIcon = (itemName: string, isMaterial: boolean, className = "h-6 w-6") => {
  return isMaterial 
    ? <MaterialIcon name={itemName} className={className} />
    : <ToolIcon name={itemName} className={className} />;
}; 