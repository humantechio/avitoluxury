/**
 * localStorage polyfill for server-side rendering
 * This ensures localStorage is always available and functional
 */

// Only run on server side
if (typeof window === 'undefined') {
  // Create a polyfill for SSR - this is necessary for Next.js SSR
  const storage: Record<string, string> = {};
  
  (global as any).localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
    key: (index: number) => Object.keys(storage)[index] || null,
    get length() { return Object.keys(storage).length; }
  };
}

export {};
