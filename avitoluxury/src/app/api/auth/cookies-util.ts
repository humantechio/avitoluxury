import { NextResponse } from 'next/server';
import { TOKEN_EXPIRY } from '../../lib/auth-utils';

// Helper function to securely log only in development
const isProduction = process.env.NODE_ENV === 'production';
const secureLog = (message: string) => {
  if (!isProduction) {
    console.log(`[DEV API] ${message}`);
  }
};

// Set authentication cookies in the response for API routes
export function setApiCookies(response: NextResponse, user: any, token: string) {
  secureLog('Setting authentication cookies');
  
  try {
    // Set HTTP-only cookie for the token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds
      path: '/'
    });
    secureLog('Set token cookie (httpOnly)');
    
    // If the user is an admin, also set admin_token cookie
    if (user.role === 'admin') {
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds
        path: '/'
      });
      secureLog('Set admin_token cookie (httpOnly)');
    }
    
    // Set non-HTTP-only cookie for login status check with a timestamp to ensure freshness
    // Use a hash of timestamp rather than showing true/false
    const timestamp = Date.now();
    const authHash = btoa(`${timestamp}`);
    
    response.cookies.set('isLoggedIn', authHash, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRY / 1000,
      path: '/'
    });
    secureLog('Set isLoggedIn cookie');
    
    // Set non-HTTP-only cookie for user data (non-sensitive)
    // Create a safe version of the user object, hiding sensitive data
    const safeUserId = typeof user._id === 'object' && user._id !== null 
      ? user._id.toString() 
      : user.userId || user._id;
      
    // Create a minimal safe user object with only necessary information
    const userData = {
      userId: safeUserId,
      name: user.name,
      role: user.role,
      email: user.email // Include email for user interface display purposes
    };
    
    response.cookies.set('userData', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRY / 1000,
      path: '/'
    });
    secureLog('Set userData cookie');
    
  } catch (error) {
    secureLog('Error setting cookies');
    if (!isProduction) {
      console.error('Error setting cookies details:', error);
    }
  }
  
  return response;
}

// Clear authentication cookies in the response
export function clearApiCookies(response: NextResponse) {
  secureLog('Clearing authentication cookies');
  
  try {
    // For all cookies, set with these options to ensure proper deletion
    const cookieOptions = {
      httpOnly: true, // We set all cookies to httpOnly for deletion to be thorough
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
      sameSite: 'lax' as const
    };
    
    response.cookies.set('token', '', cookieOptions);
    response.cookies.set('isLoggedIn', '', cookieOptions);
    response.cookies.set('userData', '', cookieOptions);
    
    // Also try alternative deletion approach for better cross-browser compatibility
    response.headers.append('Set-Cookie', 'token=; Path=/; Max-Age=0; SameSite=Lax');
    response.headers.append('Set-Cookie', 'isLoggedIn=; Path=/; Max-Age=0; SameSite=Lax');
    response.headers.append('Set-Cookie', 'userData=; Path=/; Max-Age=0; SameSite=Lax');
    
    secureLog('All cookies cleared successfully');
  } catch (error) {
    secureLog('Error clearing cookies');
    if (!isProduction) {
      console.error('Error clearing cookies details:', error);
    }
  }
  
  return response;
} 