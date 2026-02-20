'use client';

/**
 * Safe storage utilities that handle SSR gracefully
 * These functions check if window is defined before accessing localStorage
 */

/**
 * Safely get an item from localStorage
 * @param key - The localStorage key
 * @param defaultValue - Default value if key doesn't exist or SSR
 * @returns The stored value or default value
 */
export function safeGetItem(key: string, defaultValue: string | null = null): string | null {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    return localStorage.getItem(key) ?? defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely set an item in localStorage
 * @param key - The localStorage key
 * @param value - The value to store
 */
export function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
}

/**
 * Safely remove an item from localStorage
 * @param key - The localStorage key
 */
export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Safely clear all items from localStorage
 */
export function safeClear(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Check if localStorage is available
 * @returns true if localStorage is available, false otherwise
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}
