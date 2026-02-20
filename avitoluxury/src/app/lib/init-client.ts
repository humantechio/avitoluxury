'use client';

/**
 * Client-side initialization to ensure localStorage is properly available
 * This file should be imported at the top level of client components
 */

// Ensure localStorage is available and has the correct methods
if (typeof window !== 'undefined') {
  // Check if localStorage exists and has the required methods
  if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') {
    console.warn('localStorage is not properly available, creating fallback');
    
    // Create a simple in-memory fallback
    const memoryStorage: Record<string, string> = {};
    
    (window as any).localStorage = {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, value: string) => { memoryStorage[key] = value; },
      removeItem: (key: string) => { delete memoryStorage[key]; },
      clear: () => { Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]); },
      key: (index: number) => Object.keys(memoryStorage)[index] || null,
      get length() { return Object.keys(memoryStorage).length; }
    };
  }
}

export {};
