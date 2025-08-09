'use client';

import { useState, useEffect } from 'react';
import { breakpoints } from '../utils/responsiveUtils';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Hook to detect current breakpoint and provide responsive utilities
 */
export const useResponsive = () => {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('md');
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      // Update current breakpoint
      if (window.innerWidth < breakpoints.sm) {
        setCurrentBreakpoint('xs');
      } else if (window.innerWidth < breakpoints.md) {
        setCurrentBreakpoint('sm');
      } else if (window.innerWidth < breakpoints.lg) {
        setCurrentBreakpoint('md');
      } else if (window.innerWidth < breakpoints.xl) {
        setCurrentBreakpoint('lg');
      } else if (window.innerWidth < breakpoints['2xl']) {
        setCurrentBreakpoint('xl');
      } else {
        setCurrentBreakpoint('2xl');
      }
    };
    
    // Set initial values
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    windowWidth,
    currentBreakpoint,
    isMobile: windowWidth < breakpoints.md,
    isTablet: windowWidth >= breakpoints.md && windowWidth < breakpoints.lg,
    isDesktop: windowWidth >= breakpoints.lg,
    isBreakpoint: (bp: Breakpoint) => currentBreakpoint === bp,
    isAtLeastBreakpoint: (bp: Breakpoint) => windowWidth >= breakpoints[bp],
    isAtMostBreakpoint: (bp: Breakpoint) => windowWidth < breakpoints[bp],
  };
}; 