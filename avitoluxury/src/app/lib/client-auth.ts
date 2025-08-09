'use client';

// Client-safe auth utilities that don't import mongoose or other server-only modules

// Token expiration time (24 hours)
export const expTime = '24h';
// Token expiration in milliseconds (24 hours)
export const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Client-side check if a JWT token is valid (not expired)
 * Note: This only checks expiry, not signature validity
 */
export function isTokenValid(token: string): boolean {
  if (!token) return false;
  
  try {
    // Parse the JWT without verifying signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    // Silent error handling for security
    return false;
  }
}

/**
 * Get user info from a JWT token without verifying signature
 * Only for client-side display purposes, not for authentication
 */
export function getUserFromTokenClient(token: string) {
  if (!token) return null;
  
  try {
    // Parse the JWT without verifying signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    // Silent error handling for security
    return null;
  }
}

// Client-side auth helpers
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check for client-side cookie indicator
    const loginStatus = document.cookie
      .split('; ')
      .find(row => row.startsWith('isLoggedIn='))
      ?.split('=')[1];
      
    return loginStatus === 'true';
  } catch (error) {
    // Silent error handling for security
    return false;
  }
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  
  // First check if the login status indicates we're logged in
  if (!isAuthenticated()) return null;
  
  try {
    // User data is stored in a regular cookie (not sensitive data)
    const userDataCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1];
      
    return userDataCookie ? JSON.parse(decodeURIComponent(userDataCookie)) : null;
  } catch (error) {
    // Silent error handling for security
    return null;
  }
};

export const logout = async () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Remove client-side cookies
    document.cookie = 'isLoggedIn=; Path=/; Max-Age=0; SameSite=Lax';
    document.cookie = 'userData=; Path=/; Max-Age=0; SameSite=Lax';
    
    // Call the logout API to clear HTTP-only cookies
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include' // Important for cookies
    });
    
    // Force refresh to ensure all state is cleared
    window.location.href = '/';
  } catch (error) {
    // Silent error handling for security
    window.location.href = '/';
  }
}; 