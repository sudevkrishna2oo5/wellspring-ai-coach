
import { useState, useEffect } from 'react';

// Breakpoints matching Tailwind's default breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

type BreakpointKey = keyof typeof breakpoints;

export function useResponsive() {
  // Initialize with default values
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  
  // Update window size when resizing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // Set initial size
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Helper functions to check breakpoints
  const isBreakpoint = (breakpoint: BreakpointKey) => {
    return windowSize.width >= breakpoints[breakpoint];
  };
  
  // Common responsive helpers
  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < breakpoints.md,
    isTablet: windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg,
    isDesktop: windowSize.width >= breakpoints.lg,
    isSmallScreen: windowSize.width < breakpoints.sm,
    isMediumScreen: windowSize.width >= breakpoints.md,
    isLargeScreen: windowSize.width >= breakpoints.lg,
    isExtraLargeScreen: windowSize.width >= breakpoints.xl,
    is2XLScreen: windowSize.width >= breakpoints['2xl'],
    isBreakpoint,
    breakpoints
  };
}

export default useResponsive;
