import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './src/app/lib/auth-utils';

// Protected paths that require authentication
const protectedPaths = [
  '/account',
  '/account/wishlist',
  '/account/orders'
];

// Protect all /admin pages and subpages
const adminBasePath = '/admin';

// Paths that should always be accessible
const publicPaths = [
  '/admin/login',
  '/login',
  '/register'
];

// Helper function to check if we're in development mode or on localhost
function isDevelopmentOrLocalhost(hostname: string): boolean {
  return process.env.NODE_ENV !== 'production' || 
         hostname.includes('localhost') || 
         hostname.includes('127.0.0.1');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Skip domain-based routing for development or localhost
  const isDevOrLocal = isDevelopmentOrLocalhost(hostname);
  
  // Domain-based routing logic for production environment
  if (!isDevOrLocal) {
    // Admin subdomain handling
    if (hostname === 'admin.avitoluxury.in') {
      // Check if user is authenticated for admin routes
      const session = await getSessionFromRequest(request);
      
      // For admin login page, allow access
      if (pathname === '/admin/login') {
        return applySecurityHeaders(NextResponse.next());
      }
      
      // Redirect root path to admin login or dashboard based on authentication
      if (pathname === '/' || pathname === '') {
        if (session && session.role === 'admin') {
          return applySecurityHeaders(NextResponse.redirect(new URL('/admin/dashboard', request.url)));
        } else {
          return applySecurityHeaders(NextResponse.redirect(new URL('/admin/login', request.url)));
        }
      }
      
      // Block access to store routes on admin subdomain
      if (pathname.startsWith('/store-routes')) {
        return applySecurityHeaders(
          NextResponse.redirect(new URL(`https://avitoluxury.in${pathname}`, request.url))
        );
      }
      
      // For all other admin paths, require admin authentication
      if (pathname.startsWith('/admin') && (!session || session.role !== 'admin')) {
        return applySecurityHeaders(NextResponse.redirect(new URL('/admin/login', request.url)));
      }
      
      // Redirect non-admin paths to main domain
      if (!pathname.startsWith('/admin') && !pathname.startsWith('/_next')) {
        return applySecurityHeaders(
          NextResponse.redirect(new URL(`https://avitoluxury.in${pathname}`, request.url))
        );
      }
    } 
    // Main domain handling
    else if (hostname === 'avitoluxury.in' || hostname === 'www.avitoluxury.in') {
      // Redirect admin paths to admin subdomain
      if (pathname.startsWith('/admin')) {
        return applySecurityHeaders(
          NextResponse.redirect(new URL(`https://admin.avitoluxury.in${pathname}`, request.url))
        );
      }
      
      // Redirect root path to store
      if (pathname === '/' || pathname === '') {
        return applySecurityHeaders(
          NextResponse.redirect(new URL('/store-routes/store', request.url))
        );
      }
    }
    
    // Handle www to non-www redirect if needed
    if (hostname === 'www.avitoluxury.in') {
      return applySecurityHeaders(
        NextResponse.redirect(new URL(`https://avitoluxury.in${pathname}`, request.url))
      );
    }
  }

  // Skip middleware for static files and certain API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('favicon') ||
    pathname.includes('.') ||
    publicPaths.some(path => pathname === path)
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Get session from cookies for protected routes
  if (
    pathname.startsWith(adminBasePath) || 
    protectedPaths.some(path => pathname.startsWith(path))
  ) {
    const session = await getSessionFromRequest(request);

    // Check if the path is admin-only
    const isAdminPath = pathname.startsWith(adminBasePath);

    // Check if the path is protected
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    // If path is admin-only and user is not an admin, redirect to admin login
    if (isAdminPath && (!session || session.role !== 'admin')) {
      return applySecurityHeaders(NextResponse.redirect(new URL('/admin/login', request.url)));
    }

    // If path is protected and user is not authenticated, redirect to login
    if (isProtectedPath && !session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Get response for the request
  const response = NextResponse.next({
    request: {
      // Apply new request headers
      headers: requestHeaders,
    }
  });
  
  // Add security headers to prevent data leakage
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), camera=()');
  
  // Add Content-Security-Policy to prevent console logging exploits
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; " +
    "connect-src 'self' https://*.cloudinary.com https://*.razorpay.com; " +
    "img-src 'self' data: blob: https://*.cloudinary.com https://placehold.co https://storage.googleapis.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "font-src 'self' data:; " +
    "frame-src 'self' https://checkout.razorpay.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "report-uri /api/csp-report;"
  );
  
  // Return response
  return response;
}

// Helper function to get session from request
async function getSessionFromRequest(request: NextRequest) {
  try {
    // First try to get token from cookie - check both admin_token and regular token
    const adminToken = request.cookies.get('admin_token')?.value;
    const regularToken = request.cookies.get('token')?.value;
    const token = adminToken || regularToken;
    
    // If no token in cookie, check authorization header
    const authToken = token || request.headers.get('authorization')?.split(' ')[1] || null;
    
    // If no token found, return null
    if (!authToken) {
      return null;
    }
    
    // Decrypt and verify the token
    const payload = await decrypt(authToken);
    if (!payload) {
      return null;
    }
    
    // Return user info from payload
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role
    };
  } catch (error) {
    // Silent error handling for security
    return null;
  }
}

// Helper function to apply security headers to any response
function applySecurityHeaders(response: NextResponse) {
  // Add security headers
  const securityHeaders = {
    // Content Security Policy to prevent XSS attacks and console exploits
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self'; img-src 'self' data: blob: https://*.cloudinary.com; style-src 'self' 'unsafe-inline'; font-src 'self';"
  };

  // Apply all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except API routes and static files
    '/((?!api|_next/static|_next/image|_next/webpack|favicon.ico).*)',
  ],
}; 