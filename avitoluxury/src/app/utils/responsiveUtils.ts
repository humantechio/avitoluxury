'use client';

/**
 * Responsive utility functions for use across the application
 */

// Breakpoints matching tailwind config
export const breakpoints = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Hook to detect if the current viewport is mobile
 * @returns {boolean} True if viewport width is less than md breakpoint
 */
export const useIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints.md;
};

/**
 * Hook to detect if the current viewport is tablet
 * @returns {boolean} True if viewport width is between md and lg breakpoints
 */
export const useIsTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg;
};

/**
 * Hook to detect if the current viewport is desktop
 * @returns {boolean} True if viewport width is greater than or equal to lg breakpoint
 */
export const useIsDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.lg;
};

/**
 * Get responsive padding based on screen size
 * @returns {string} Tailwind padding classes
 */
export const getResponsivePadding = (): string => {
  if (typeof window === 'undefined') return 'px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8';
  
  if (window.innerWidth < breakpoints.md) {
    return 'px-4 py-4';
  } else if (window.innerWidth < breakpoints.lg) {
    return 'px-6 py-6';
  } else {
    return 'px-8 py-8';
  }
};

/**
 * Get responsive font size based on screen size
 * @param {string} size - Size category: 'xs', 'sm', 'base', 'lg', 'xl', '2xl', etc.
 * @returns {string} Tailwind font size classes
 */
export const getResponsiveFontSize = (size: string): string => {
  switch (size) {
    case 'xs':
      return 'text-xs md:text-xs';
    case 'sm':
      return 'text-xs md:text-sm';
    case 'base':
      return 'text-sm md:text-base';
    case 'lg':
      return 'text-base md:text-lg';
    case 'xl':
      return 'text-lg md:text-xl';
    case '2xl':
      return 'text-xl md:text-2xl';
    case '3xl':
      return 'text-2xl md:text-3xl';
    case '4xl':
      return 'text-3xl md:text-4xl';
    default:
      return 'text-base md:text-base';
  }
}; 