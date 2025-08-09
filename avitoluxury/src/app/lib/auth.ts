'use client';

import { NextResponse } from 'next/server';
import { TOKEN_EXPIRY, isAuthenticated, getUser, logout } from './client-auth';

// Re-export client-side auth helpers
export { isAuthenticated, getUser, logout };

// Utility for protected routes
export const requireAuth = (router: any) => {
  if (typeof window === 'undefined') return false;
  
  if (!isAuthenticated()) {
    // Save current path for redirect after login
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/signup') {
      localStorage.setItem('returnUrl', currentPath);
    }
    
    // Redirect to login
    router.push('/login');
    return false;
  }
  
  return true;
};

// Utility for auth pages (login/signup) to redirect away if logged in
export const redirectIfAuthenticated = (router: any) => {
  if (typeof window === 'undefined') return;
  
  if (isAuthenticated()) {
    const returnUrl = localStorage.getItem('returnUrl') || '/store-routes';
    localStorage.removeItem('returnUrl');
    router.push(returnUrl);
  }
};

// Set authentication cookies in the response
export function setAuthCookies(response: NextResponse, user: any, token: string) {
  // Set HTTP-only cookie for the token
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds
    path: '/'
  });
  
  // Set non-HTTP-only cookie for login status check
  response.cookies.set('isLoggedIn', 'true', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRY / 1000,
    path: '/'
  });
  
  // Set non-HTTP-only cookie for user data (non-sensitive)
  const userData = {
    userId: user.userId || user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  
  response.cookies.set('userData', JSON.stringify(userData), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRY / 1000,
    path: '/'
  });
  
  return response;
}

// Clear authentication cookies in the response
export function clearAuthCookies(response: NextResponse) {
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/'
  });
  
  response.cookies.set('isLoggedIn', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/'
  });
  
  response.cookies.set('userData', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/'
  });
  
  return response;
}