/**
 * localStorage polyfill for server-side rendering
 * This ensures localStorage is always available and functional
 */

// Only run on server side
if (typeof window === 'undefined') {
  // Create a mock localStorage for SSR
  const mockStorage: Record<string, string> = {};
  
  (global as any).localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); },
    key: (index: number) => Object.keys(mockStorage)[index] || null,
    get length() { return Object.keys(mockStorage).length; }
  };
}

export {};
