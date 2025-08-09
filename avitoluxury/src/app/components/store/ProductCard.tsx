'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiShoppingBag, FiHeart, FiStar } from 'react-icons/fi';
import { useAuth } from '@/app/components/AuthProvider';
import Image from 'next/image';

// Custom event for cart updates
export const triggerMiniCartOpen = () => {
  // Create and dispatch a custom event that Nav.tsx can listen for
  const event = new CustomEvent('openMiniCart');
  window.dispatchEvent(event);
};

interface Product {
  _id: string;
  name: string;
  productType: string;
  description: string;
  price: number;
  discountedPrice: number;
  category: string;
  subCategory?: string;
  images: { url: string }[];
  rating?: number;
  mainImage?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  // Check if product is in wishlist when component loads
  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus();
    } else {
      // For non-authenticated users, use localStorage
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const isInWishlist = wishlist.some((item: any) => item.productId === product._id);
        setIsWishlisted(isInWishlist);
      } catch (error) {
        // Silent error handling
        setIsWishlisted(false);
      }
    }
  }, [product._id, isAuthenticated]);
  
  const checkWishlistStatus = async () => {
    try {
      // Only attempt to fetch wishlist if user is authenticated
      if (!isAuthenticated) {
        return;
      }
      
      const response = await fetch('/api/wishlist', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      // Don't attempt to parse JSON for 401 responses
      if (response.status === 401) {
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      
      const data = await response.json();
      
      if (data.success && data.wishlist && Array.isArray(data.wishlist.items)) {
        const isInWishlist = data.wishlist.items.some(
          (item: any) => item.productId === product._id
        );
        setIsWishlisted(isInWishlist);
      }
    } catch (error) {
      // Silent error handling
      // Don't show error to user, just silently fail
    }
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    
    // Using the improved AddToCartButton component's functionality directly
    import('@/app/components/AddToCartButton').then(module => {
      // Get the trigger function
      const { triggerMiniCartOpen } = module;
      
      // Update localStorage cart
      addToLocalStorageCart(false);
      
      // Show mini cart
      triggerMiniCartOpen();
      
      // Reset loading state
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 800);
    });
  };
  
  // Helper function to add item to localStorage cart
  const addToLocalStorageCart = (showAlert = true) => {
    try {
      // Get existing cart or initialize empty array
      const savedCart = localStorage.getItem('cart') || '[]';
      let cart = [];
      
      try {
        cart = JSON.parse(savedCart);
        if (!Array.isArray(cart)) {
          // Reset cart if it's invalid
          cart = [];
        }
      } catch (parseError) {
        // Reset cart on parse error
        cart = [];
      }
      
      // Check if product is already in cart
      const existingItemIndex = cart.findIndex((item: any) => item.id === product._id);
      
      if (existingItemIndex >= 0) {
        // If product exists, increase quantity
        cart[existingItemIndex].quantity += 1;
      } else {
        // Otherwise add new item
        cart.push({
          id: product._id,
          name: product.name,
          price: product.discountedPrice > 0 ? product.discountedPrice : product.price,
          image: getImageUrl(), // Use the same image URL function as in the component
          quantity: 1
        });
      }
      
      // Save updated cart
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Force UI update across components by manually triggering storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(cart),
        storageArea: localStorage
      }));
      
      // Also update a timestamp to force refresh
      localStorage.setItem('cart_updated', Date.now().toString());
      
      // Show success message if requested
      if (showAlert) {
        // Use mini cart instead of alert
        triggerMiniCartOpen();
      }
    } catch (error) {
      console.error('Error adding to localStorage cart:', error);
      alert('Failed to add product to cart. Please try again.');
    }
  };
  
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    try {
      if (isWishlisted) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?productId=${product._id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove from wishlist');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setIsWishlisted(false);
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId: product._id }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to add to wishlist');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setIsWishlisted(true);
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };
  
  const discount = (product.discountedPrice > 0 && product.price > 0)
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) 
    : 0;
  
  // Generate stars for rating
  const renderRatingStars = () => {
    const stars = [];
    const rating = product.rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStar key={`star-${i}`} className="w-4 h-4 text-black fill-current" />
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half-star" className="relative w-4 h-4">
          <FiStar className="absolute w-4 h-4 text-black fill-current" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          <FiStar className="absolute w-4 h-4 text-gray-300" />
        </div>
      );
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FiStar key={`empty-star-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }
    
    return stars;
  };

  // Fallback image URL - use a local image instead of external service
  const fallbackImageUrl = '/images/placeholder-product.jpg';
  
  // Determine the image URL to use
  const getImageUrl = () => {
    // First check if there's an image error
    if (imageError) {
      return fallbackImageUrl;
    }
    
    // Check if product has images array with valid URL
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Handle both object format { url: string } and direct string format
      if (typeof product.images[0] === 'string') {
        return product.images[0];
      } else if (product.images[0]?.url) {
        return product.images[0].url;
      }
    }
    
    // Check if product has mainImage as fallback
    if (product.mainImage) {
      return product.mainImage;
    }
    
    // Default fallback
    return fallbackImageUrl;
  };
  
  const imageUrl = getImageUrl();
    
  return (
    <div
      className="h-full flex flex-col premium-card overflow-hidden relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* On Sale Tag */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 xs:top-3 xs:left-3 sale-tag z-10 text-xs xs:text-sm">
          On Sale
        </div>
      )}
      
      {/* Product Image - Link wrapper */}
      <Link href={`/product/${product._id}`} className="block relative h-48 xs:h-56 sm:h-60 md:h-64 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          width={400}
          height={500}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
          onError={() => setImageError(true)}
        />
      </Link>
      
      {/* Product Info */}
      <div className="p-3 xs:p-4 flex-grow flex flex-col">
        {/* Product Type */}
        <div className="text-xs text-gray-500 uppercase mb-1">
          {product.productType}
        </div>
        
        {/* Title - Link wrapper */}
        <Link href={`/product/${product._id}`} className="block">
          <h3 className="text-xs xs:text-sm font-medium mb-1 xs:mb-2 line-clamp-1 font-lastica">
            {product.name}
          </h3>
        </Link>
        
        {/* Sub-Category */}
        <p className="text-xs text-gray-500 mb-1 xs:mb-2 line-clamp-1">
          {product.subCategory}
        </p>
        
        {/* Price */}
        <div className="flex items-center justify-center mt-auto mb-2 xs:mb-3">
          {product.discountedPrice > 0 ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1 xs:gap-2">
                <span className="text-xs xs:text-sm font-medium text-black">₹{product.discountedPrice.toFixed(2)}</span>
                <span className="text-xs text-gray-500 line-through">MRP ₹{product.price.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <span className="text-xs xs:text-sm font-medium text-black">₹{product.price.toFixed(2)}</span>
          )}
        </div>
        
        {/* Add to cart button */}
        <button 
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="w-full flex items-center justify-center space-x-2 py-2 xs:py-2.5 sm:py-3 px-3 xs:px-4 bg-black text-white hover:bg-[#333] transition-all duration-300 text-xs xs:text-sm rounded-none"
        >
          <span className="font-medium uppercase">{isAddingToCart ? 'Added!' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
} 