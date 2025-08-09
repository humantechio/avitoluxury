'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CartService } from '@/app/services/CartService';

// Define the shape of the context
interface AuthContextType {
  isAuthenticated: boolean;
  user: null;
  loading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always set to false since we're removing login functionality
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize cart service
  useEffect(() => {
    // Just ensure cart is loaded from localStorage
    const cartItems = CartService.getCartItems();
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user: null, loading }}>
      {children}
    </AuthContext.Provider>
  );
} 