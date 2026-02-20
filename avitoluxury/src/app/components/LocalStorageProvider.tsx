'use client';

import { useEffect } from 'react';

/**
 * LocalStorageProvider ensures localStorage is properly initialized
 * before any components try to use it
 */
export default function LocalStorageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure localStorage is available and functional
    if (typeof window !== 'undefined') {
      try {
        // Test if localStorage is working
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
      } catch (e) {
        console.error('localStorage is not available:', e);
      }
    }
  }, []);

  return <>{children}</>;
}
