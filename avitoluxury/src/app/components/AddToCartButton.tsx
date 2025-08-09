'use client';

import React, { useState } from 'react';
import { FiShoppingBag } from 'react-icons/fi';
import { useAuth } from './AuthProvider';
import { CartService } from '@/app/services/CartService';
import { UserActivityTracker } from '@/app/services/UserActivityTracker';

// Custom event for cart updates
export const triggerMiniCartOpen = () => {
  // Create and dispatch a custom event that Nav.tsx can listen for
  const event = new CustomEvent('openMiniCart');
  window.dispatchEvent(event);
};

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  className?: string;
  showIcon?: boolean;
  quantity?: number;
}

export default function AddToCartButton({
  productId,
  productName,
  productPrice,
  productImage,
  className = '',
  showIcon = true,
  quantity = 1
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    
    try {
      // Add to cart using CartService
      CartService.addItem({
        id: productId,
        _id: productId, // Add _id for consistency
        name: productName,
        price: productPrice,
        image: productImage,
        quantity
      });
      
      // If user is authenticated, sync with server
      if (isAuthenticated) {
        await CartService.syncWithServer(true);
      }
      
      // Track the event
      UserActivityTracker.trackAddToCart(
        productId,
        productName,
        productPrice,
        quantity,
        user?.userId
      );
      
      // Show mini cart
      triggerMiniCartOpen();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      // Reset loading state after a short delay to show the animation
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className={`${className} relative overflow-hidden flex items-center justify-center`}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding...
        </span>
      ) : (
        <>
          {showIcon && <FiShoppingBag className="mr-2" />}
          Add to Cart
        </>
      )}
    </button>
  );
} 