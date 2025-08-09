'use client';

import { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  _id?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export const CartService = {
  // Get cart items from localStorage
  getCartItems: (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  },
  
  // Save cart items to localStorage
  saveCartItems: (items: CartItem[]): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('cart', JSON.stringify(items));
      localStorage.setItem('cart_updated', Date.now().toString());
      
      // Trigger storage event for other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(items),
        storageArea: localStorage
      }));
      
      // Also dispatch a custom event for components that don't listen to storage
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },
  
  // Add item to cart
  addItem: (item: CartItem): void => {
    const cart = CartService.getCartItems();
    const existingItemIndex = cart.findIndex(cartItem => 
      cartItem.id === item.id || 
      (item._id && cartItem.id === item._id)
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      cart.push({
        id: item.id || item._id || '',
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      });
    }
    
    CartService.saveCartItems(cart);
  },
  
  // Update item quantity
  updateQuantity: (itemId: string, quantity: number): void => {
    if (quantity < 1) return;
    
    const cart = CartService.getCartItems();
    const updatedCart = cart.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    
    CartService.saveCartItems(updatedCart);
  },
  
  // Remove item from cart
  removeItem: (itemId: string): void => {
    const cart = CartService.getCartItems();
    const updatedCart = cart.filter(item => 
      !(item.id === itemId || item._id === itemId)
    );
    
    CartService.saveCartItems(updatedCart);
  },
  
  // Clear cart
  clearCart: (): void => {
    CartService.saveCartItems([]);
  },
  
  // Calculate cart total
  getCartTotal: (): number => {
    const cart = CartService.getCartItems();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  // Get cart count
  getCartCount: (): number => {
    const cart = CartService.getCartItems();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },
  
  // Sync cart with server (for logged-in users)
  syncWithServer: async (isAuthenticated: boolean): Promise<void> => {
    if (!isAuthenticated) return;
    
    try {
      // Get current local cart
      const localCart = CartService.getCartItems();
      
      // If no local items, try to get cart from server
      if (localCart.length === 0) {
        const response = await fetch('/api/cart', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cart && data.cart.items && data.cart.items.length > 0) {
            // Save server cart to localStorage
            CartService.saveCartItems(data.cart.items);
          }
        }
      } else {
        // If local items exist, send them to server
        await fetch('/api/cart', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({ items: localCart }),
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Error syncing cart with server:', error);
    }
  },
  
  // Handle user login
  handleLogin: async (): Promise<void> => {
    try {
      // Keep the local cart items when user logs in
      // They will be synced to the server by syncWithServer
    } catch (error) {
      console.error('Error handling login for cart:', error);
    }
  },
  
  // Handle user logout
  handleLogout: (): void => {
    // Clear the cart on logout
    CartService.clearCart();
  }
};

// Hook for cart management
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadCart = () => {
      const cartItems = CartService.getCartItems();
      setItems(cartItems);
      setTotal(CartService.getCartTotal());
      setCount(CartService.getCartCount());
      setLoading(false);
    };
    
    loadCart();
    
    // Listen for cart updates
    window.addEventListener('storage', loadCart);
    window.addEventListener('cart-updated', loadCart);
    window.addEventListener('auth_change', loadCart);
    
    return () => {
      window.removeEventListener('storage', loadCart);
      window.removeEventListener('cart-updated', loadCart);
      window.removeEventListener('auth_change', loadCart);
    };
  }, []);

  return {
    items,
    total,
    count,
    loading,
    addItem: (item: CartItem) => {
      CartService.addItem(item);
      setItems(CartService.getCartItems());
      setTotal(CartService.getCartTotal());
      setCount(CartService.getCartCount());
    },
    updateQuantity: (itemId: string, quantity: number) => {
      CartService.updateQuantity(itemId, quantity);
      setItems(CartService.getCartItems());
      setTotal(CartService.getCartTotal());
      setCount(CartService.getCartCount());
    },
    removeItem: (itemId: string) => {
      CartService.removeItem(itemId);
      setItems(CartService.getCartItems());
      setTotal(CartService.getCartTotal());
      setCount(CartService.getCartCount());
    },
    clearCart: () => {
      CartService.clearCart();
      setItems([]);
      setTotal(0);
      setCount(0);
    }
  };
} 