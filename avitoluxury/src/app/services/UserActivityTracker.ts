'use client';

import { useEffect, useState } from 'react';

// Types for tracking events
export interface PageViewEvent {
  type: 'page_view';
  url: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface ProductViewEvent {
  type: 'product_view';
  productId: string;
  url: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface AddToCartEvent {
  type: 'add_to_cart';
  productId: string;
  name: string;
  price: number;
  quantity: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface AddToWishlistEvent {
  type: 'add_to_wishlist';
  productId: string;
  name: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface SearchEvent {
  type: 'search';
  query: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export type UserEvent = 
  | PageViewEvent 
  | ProductViewEvent 
  | AddToCartEvent 
  | AddToWishlistEvent 
  | SearchEvent;

// Generate a random session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Get session ID from storage or create a new one
const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('session_id', sessionId);
  }
  
  return sessionId;
};

// UserActivityTracker service
export const UserActivityTracker = {
  // Track a user event
  trackEvent: async (event: UserEvent): Promise<void> => {
    try {
      // Send event to the server
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
      
      // Store in localStorage for debug purposes
      const events = UserActivityTracker.getLocalEvents();
      events.push(event);
      
      // Keep only the latest 100 events
      if (events.length > 100) {
        events.shift();
      }
      
      localStorage.setItem('user_events', JSON.stringify(events));
    } catch (error) {
      console.error('Error tracking user event:', error);
    }
  },
  
  // Track page view
  trackPageView: (url: string, userId?: string): void => {
    const event: PageViewEvent = {
      type: 'page_view',
      url,
      timestamp: Date.now(),
      userId,
      sessionId: getSessionId()
    };
    
    UserActivityTracker.trackEvent(event);
  },
  
  // Track product view
  trackProductView: (productId: string, url: string, userId?: string): void => {
    const event: ProductViewEvent = {
      type: 'product_view',
      productId,
      url,
      timestamp: Date.now(),
      userId,
      sessionId: getSessionId()
    };
    
    UserActivityTracker.trackEvent(event);
  },
  
  // Track add to cart
  trackAddToCart: (productId: string, name: string, price: number, quantity: number, userId?: string): void => {
    const event: AddToCartEvent = {
      type: 'add_to_cart',
      productId,
      name,
      price,
      quantity,
      timestamp: Date.now(),
      userId,
      sessionId: getSessionId()
    };
    
    UserActivityTracker.trackEvent(event);
  },
  
  // Track add to wishlist
  trackAddToWishlist: (productId: string, name: string, userId?: string): void => {
    const event: AddToWishlistEvent = {
      type: 'add_to_wishlist',
      productId,
      name,
      timestamp: Date.now(),
      userId,
      sessionId: getSessionId()
    };
    
    UserActivityTracker.trackEvent(event);
  },
  
  // Track search
  trackSearch: (query: string, userId?: string): void => {
    const event: SearchEvent = {
      type: 'search',
      query,
      timestamp: Date.now(),
      userId,
      sessionId: getSessionId()
    };
    
    UserActivityTracker.trackEvent(event);
  },
  
  // Get local events for debugging
  getLocalEvents: (): UserEvent[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const events = localStorage.getItem('user_events');
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Error getting local events:', error);
      return [];
    }
  },
  
  // Clear local events
  clearLocalEvents: (): void => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('user_events');
  }
};

// Hook for user activity tracking
export function useUserActivityTracker(userId?: string) {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  
  // Track initial page view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.pathname + window.location.search;
      setCurrentUrl(url);
      UserActivityTracker.trackPageView(url, userId);
      
      // Track navigation changes
      const handleRouteChange = () => {
        const newUrl = window.location.pathname + window.location.search;
        if (newUrl !== currentUrl) {
          setCurrentUrl(newUrl);
          UserActivityTracker.trackPageView(newUrl, userId);
        }
      };
      
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [userId, currentUrl]);
  
  return {
    trackProductView: (productId: string) => 
      UserActivityTracker.trackProductView(productId, currentUrl, userId),
    trackAddToCart: (productId: string, name: string, price: number, quantity: number) => 
      UserActivityTracker.trackAddToCart(productId, name, price, quantity, userId),
    trackAddToWishlist: (productId: string, name: string) => 
      UserActivityTracker.trackAddToWishlist(productId, name, userId),
    trackSearch: (query: string) => 
      UserActivityTracker.trackSearch(query, userId)
  };
} 