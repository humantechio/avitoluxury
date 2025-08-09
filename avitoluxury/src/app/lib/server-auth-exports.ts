// This file re-exports server-side authentication functions for compatibility
// This file should only be imported by server components and API routes

// Re-export all the server-auth functions
export * from './server-auth';

// Add a getSession function for backward compatibility
import { cookies } from 'next/headers';
import { getUserFromToken } from './server-auth';

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const user = await getUserFromToken(token);
    return user;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
} 