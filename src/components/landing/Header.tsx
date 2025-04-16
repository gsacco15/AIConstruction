import React, { useRef, useState } from "react";

const navigationItems = ["Bathroom", "Kitchen", "Bedroom", "Living Room"];

export default function Header() {
  const [activeTab, setActiveTab] = React.useState("Bathroom");
  const [prevActiveTab, setPrevActiveTab] = React.useState(activeTab);
  const [animatingTabs, setAnimatingTabs] = React.useState<string[]>([]);
  const [slideDirection, setSlideDirection] = React.useState<'left' | 'right'>('right');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Track if we're in the middle of an animation
  const isAnimating = useRef(false);

  const handleTabChange = (item: string) => {
    if (item === activeTab || isAnimating.current) return;
    
    // Determine slide direction based on tab order
    const currentIndex = navigationItems.indexOf(activeTab);
    const newIndex = navigationItems.indexOf(item);
    const direction = newIndex > currentIndex ? 'right' : 'left';
    setSlideDirection(direction);
    
    isAnimating.current = true;
    setAnimatingTabs([activeTab, item]);
    
    // First slide out the current tab
    setPrevActiveTab(activeTab);
    
    // After slide out animation completes, change the active tab
    setTimeout(() => {
      setActiveTab(item);
      // After slide in animation completes, reset animation state
      setTimeout(() => {
        isAnimating.current = false;
        setAnimatingTabs([]);
      }, 300);
    }, 150);
  };

  const handleTitleClick = () => {
    // Reload the page when the title is clicked
    window.location.reload();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden w-full max-w-6xl mx-auto pt-6 px-4">
        {/* Top bar with logo and menu icon - always visible on mobile */}
        <div className="flex justify-between items-center w-full mb-4">
          <div 
            className="font-bold text-3xl tracking-[-0.6px] font-['Inter'] cursor-pointer"
            onClick={handleTitleClick}
          >
            <span className="bg-gradient-to-r from-black via-black to-[#9747FF] bg-clip-text text-transparent">
              AI Construction
            </span>
          </div>
          
          <button 
            className="w-[28px] h-[24px] flex flex-col justify-center cursor-pointer"
            onClick={toggleMobileMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="11" viewBox="0 0 28 11" fill="none">
              <path d="M26 2H2" stroke="#303030" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M26 9H10.3478" stroke="#303030" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        {/* Mobile navigation menu - only visible when toggled */}
        <nav className={`w-full transition-all duration-300 ease-in-out overflow-hidden ${mobileMenuOpen ? 'max-h-[300px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
          <div className="bg-[rgba(247,247,247,0.7)] backdrop-filter backdrop-blur-[10px] flex flex-wrap items-center gap-2 p-[5px] rounded-[20px] border-[rgba(237,237,237,0.8)] border-solid border-2">
            {navigationItems.map((item) => (
              <NavButton 
                key={item}
                item={item}
                isActive={activeTab === item}
                wasPrevActive={prevActiveTab === item}
                isAnimating={animatingTabs.includes(item)}
                slideDirection={slideDirection}
                onClick={() => {
                  handleTabChange(item);
                  setMobileMenuOpen(false);
                }}
                isMobile={true}
              />
            ))}
          </div>
        </nav>
      </div>
      
      {/* Desktop header - original 3-column layout */}
      <div className="hidden md:flex w-full max-w-6xl mx-auto items-center justify-between pt-6 px-4">
        <div 
          className="font-bold text-3xl tracking-[-0.6px] my-auto font-['Inter'] cursor-pointer flex-1 flex justify-start"
          onClick={handleTitleClick}
        >
          <span className="bg-gradient-to-r from-black via-black to-[#9747FF] bg-clip-text text-transparent">
            AI Construction
          </span>
        </div>
        
        <nav className="text-[15px] text-[rgba(138,138,138,1)] font-semibold font-['Inter'] flex-1 flex justify-center">
          <div className="bg-[rgba(247,247,247,0.7)] backdrop-filter backdrop-blur-[10px] flex items-center gap-5 justify-between p-[5px] rounded-[43px] border-[rgba(237,237,237,0.8)] border-solid border-2 min-w-[500px]">
            {navigationItems.map((item) => (
              <NavButton 
                key={item}
                item={item}
                isActive={activeTab === item}
                wasPrevActive={prevActiveTab === item}
                isAnimating={animatingTabs.includes(item)}
                slideDirection={slideDirection}
                onClick={() => handleTabChange(item)}
              />
            ))}
          </div>
        </nav>
        
        <div className="flex-1 flex justify-end">
          <button className="w-[28px] h-[24px] flex flex-col justify-center cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="11" viewBox="0 0 28 11" fill="none">
              <path d="M26 2H2" stroke="#303030" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M26 9H10.3478" stroke="#303030" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

// Extracted NavButton component for reuse
const NavButton = ({ 
  item, 
  isActive, 
  wasPrevActive, 
  isAnimating, 
  slideDirection, 
  onClick,
  isMobile = false
}: { 
  item: string, 
  isActive: boolean, 
  wasPrevActive: boolean, 
  isAnimating: boolean, 
  slideDirection: 'left' | 'right',
  onClick: () => void,
  isMobile?: boolean
}) => {
  let animationClass = '';
  if (isActive && isAnimating) {
    animationClass = slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left';
  } else if (wasPrevActive && isAnimating) {
    animationClass = slideDirection === 'right' ? 'animate-slide-out-right' : 'animate-slide-out-left';
  }
  
  return (
    <button
      onClick={onClick}
      className={`
        ${isMobile ? 'px-4 py-2 text-sm flex-grow' : 'px-[29px] py-3'} 
        rounded-[34px] 
        font-medium
        relative
        overflow-hidden
        transition-colors duration-150
        whitespace-nowrap
        ${
          isActive
            ? "bg-[rgba(32,32,32,0.9)] text-white shadow-[0px_0px_28px_rgba(0,0,0,0.23)]"
            : "hover:bg-gray-100/70 hover:shadow-sm"
        }
      `}
    >
      <span 
        className={`
          relative z-10 
          block
          ${animationClass}
        `}
        style={{
          animationDirection: slideDirection === 'left' ? 'reverse' : 'normal'
        }}
      >
        {item}
      </span>
      {isActive && (
        <span className="absolute inset-0 bg-gradient-to-tr from-[rgba(151,71,255,0.1)] to-transparent opacity-50 animate-pulse-slow z-0"></span>
      )}
    </button>
  );
}; 