'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TOKEN_EXPIRY } from './client-auth';

// Define the admin user interface
export interface AdminUser {
  userId: string;
  name: string;
  email: string;
  role: string;
}

// Constants for storage
const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';
const TIMESTAMP_KEY = 'admin_token_timestamp';
const TOKEN_EXPIRY_TIME = TOKEN_EXPIRY; // Use the same expiry time from client-auth

/**
 * Check if the admin token is still valid based on timestamp
 */
export function isTokenValid(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const timestamp = localStorage.getItem(TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const tokenTime = parseInt(timestamp);
    const currentTime = Date.now();
    
    // Check if token has expired
    return (currentTime - tokenTime) < TOKEN_EXPIRY_TIME;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
}

/**
 * Get admin user from localStorage
 */
export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    
    if (!token || !userStr || !isTokenValid()) {
      return null;
    }
    
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
}

/**
 * Save admin authentication data
 */
export function saveAdminAuth(token: string, user: AdminUser) {
  if (typeof window === 'undefined') return;
  
  try {
    // Save in localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
    
    // Also set regular auth items for middleware compatibility
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token_timestamp', Date.now().toString());
    
    // Set cookies for cross-tab support and middleware
    document.cookie = `admin_token=${token}; path=/; max-age=${TOKEN_EXPIRY_TIME / 1000}; SameSite=Lax`;
    document.cookie = `token=${token}; path=/; max-age=${TOKEN_EXPIRY_TIME / 1000}; SameSite=Lax`;
  } catch (error) {
    console.error('Error saving admin auth:', error);
  }
}

/**
 * Clear admin authentication data
 */
export function clearAdminAuth() {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);
    
    // Also clear regular auth items
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_timestamp');
    
    // Clear cookies
    document.cookie = `admin_token=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `token=; path=/; max-age=0; SameSite=Lax`;
  } catch (error) {
    console.error('Error clearing admin auth:', error);
  }
}

/**
 * Log out the admin user
 */
export async function adminLogout(router: any) {
  if (typeof window === 'undefined') return;
  
  try {
    clearAdminAuth();
    
    // Redirect to login page
    router.push('/admin/login');
  } catch (error) {
    console.error('Error logging out admin:', error);
  }
}

/**
 * Hook to check admin authentication
 */
export function useAdminAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if admin is authenticated
    const adminUser = getAdminUser();
    
    if (!adminUser) {
      // If not authenticated, redirect to login page
      router.push('/admin/login');
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }
    
    // If authenticated, set user state
    setIsAuthenticated(true);
    setUser(adminUser);
    setLoading(false);
    
    // Set up interval to periodically check token validity
    const intervalId = setInterval(() => {
      if (!isTokenValid()) {
        clearInterval(intervalId);
        adminLogout(router);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [router]);
  
  return { isAuthenticated, user, loading };
}

/**
 * Utility function to get admin token for API requests
 */
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !isTokenValid()) {
      return null;
    }
    return token;
  } catch (error) {
    console.error('Error getting admin token:', error);
    return null;
  }
} 