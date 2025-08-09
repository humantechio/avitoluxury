'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ShopNowButton from './ui/ShopNowButton';
import Image from 'next/image';

// Types
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  images: { url: string }[];
  discountPercentage?: number;
}

// Convert USD to INR
const convertToRupees = (dollarPrice: number) => {
  // Just return the original price without conversion
  return dollarPrice;
};

export default function SaleCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch products with highest discount percentage
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        // Filter for products with discount and calculate discount percentage
        const discountedProducts = data.products
          .filter((product: any) => {
            // Ensure both price and discounted price exist and are valid numbers
            return product.price && product.comparePrice && 
                  product.price > 0 && product.comparePrice > 0 &&
                  product.price > product.comparePrice;
          })
          .map((product: any) => {
            // Convert prices to rupees
            const price = convertToRupees(product.price);
            const discountedPrice = convertToRupees(product.comparePrice);
            
            // Calculate discount percentage
            const discountPercentage = ((price - discountedPrice) / price * 100);
            
            // Normalize the product images structure
            let images = [];
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
              images = product.images.map((img: any) => {
                if (typeof img === 'string') {
                  return { url: img };
                } else if (img && img.url) {
                  return img;
                }
                return null;
              }).filter(Boolean);
            }
            
            // If no valid images found, use mainImage as fallback
            if (images.length === 0 && product.mainImage) {
              images = [{ url: product.mainImage }];
            }
            
            // If still no images, use placeholder
            if (images.length === 0) {
              images = [{ url: '/perfume-placeholder.jpg' }];
            }
            
            return {
              ...product,
              price,
              discountedPrice,
              discountPercentage,
              images
            };
          })
          // Sort by discount percentage (highest first)
          .sort((a: any, b: any) => b.discountPercentage - a.discountPercentage)
          // Take top 6 highest discounted products (reduced from 10)
          .slice(0, 6);
        
        setProducts(discountedProducts);
      } catch (err: any) {
        // Silent error handling for security
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  };
  
  // Auto advance slides every 5 seconds
  useEffect(() => {
    if (products.length <= 1) return;
    
    const timer = setInterval(() => {
      goToNext();
    }, 5000);
    
    return () => clearInterval(timer);
  }, [products, currentIndex]);
  
  // Mock data in case no products with discount are found
  const mockProducts: Product[] = [
    {
      _id: 'mock1',
      name: 'Wild Escape',
      description: 'Citrus | Musk',
      price: convertToRupees(1699),
      discountedPrice: convertToRupees(1299),
      discountPercentage: 23.5,
      images: [{ url: '/perfume-placeholder.jpg' }]
    },
    {
      _id: 'mock2',
      name: 'Baked Vanilla',
      description: 'Vanilla | Gourmand',
      price: convertToRupees(1699),
      discountedPrice: convertToRupees(1299),
      discountPercentage: 23.5,
      images: [{ url: '/perfume-placeholder.jpg' }]
    },
    {
      _id: 'mock3',
      name: 'Devil\'s Berry',
      description: 'Dark Berry',
      price: convertToRupees(1699),
      discountedPrice: convertToRupees(1299),
      discountPercentage: 23.5,
      images: [{ url: '/perfume-placeholder.jpg' }]
    }
  ];
  
  // Use mock data if no products found or loading
  const displayProducts = products.length > 0 ? products : mockProducts;
  
  if (loading && displayProducts.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-lg">Loading fragrances...</div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full overflow-hidden bg-gray-50" style={{ height: 'min(700px, 90vh)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          {displayProducts[currentIndex] && (
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              {/* Image - Mobile: Full screen with link, Desktop: Left side */}
              <div className="order-1 md:order-1 flex items-center justify-center h-full bg-gray-100 relative">
                <Link href={`/product/${displayProducts[currentIndex]._id}`} className="block relative w-full h-full">
                  <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
                    <img
                      src={displayProducts[currentIndex].images && displayProducts[currentIndex].images[0]?.url || '/perfume-placeholder.jpg'}
                      alt={displayProducts[currentIndex].name || "Perfume product"}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        // Fallback to placeholder on error
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        target.src = '/perfume-placeholder.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Mobile-only discount badge */}
                  <div className="md:hidden absolute top-4 left-4 bg-red-600 text-white inline-block px-1.5 xs:px-2 py-0.5 text-xs uppercase tracking-wider z-10">
                    {Math.round(displayProducts[currentIndex].discountPercentage || 0)}% OFF
                  </div>
                  
                  {/* Mobile-only product name overlay at bottom */}
                  <div className="md:hidden absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center z-10">
                    <h3 className="text-sm xs:text-base font-medium truncate">{displayProducts[currentIndex].name}</h3>
                  </div>
                </Link>
              </div>
              
              {/* Content - Hidden on mobile, Visible on Desktop: Right side */}
              <div className="hidden md:flex order-2 md:order-2 flex-col items-center justify-center p-1 xs:p-2 sm:p-4 md:p-6 lg:p-8">
                <div className="text-center space-y-0.5 xs:space-y-1 sm:space-y-2 md:space-y-4 max-w-sm mx-auto">
                  <div className="bg-red-600 text-white inline-block px-1.5 xs:px-2 py-0.5 text-xs uppercase tracking-wider mb-0.5 xs:mb-1 md:mb-2">
                    {Math.round(displayProducts[currentIndex].discountPercentage || 0)}% OFF
                  </div>
                  
                  <h2 className="text-sm xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold font-serif">
                    {displayProducts[currentIndex].name}
                  </h2>
                  
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 sm:line-clamp-2">
                    {displayProducts[currentIndex].description}
                  </p>
                  
                  <div className="flex flex-row items-center justify-center gap-1 xs:gap-2 md:gap-4 my-0.5 xs:my-1 sm:my-2 md:my-4">
                    <span className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                      ₹{displayProducts[currentIndex].discountedPrice}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 line-through">
                      ₹{displayProducts[currentIndex].price}
                    </span>
                  </div>
                  
                  <div className="mt-0.5 xs:mt-1 sm:mt-2 md:mt-4">
                    <ShopNowButton href={`/product/${displayProducts[currentIndex]._id}`} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation arrows - hidden on small screens, visible on medium and up */}
      <button
        onClick={goToPrev}
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
        aria-label="Previous product"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>
      
      <button
        onClick={goToNext}
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
        aria-label="Next product"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
      
      {/* Indicators - hidden on mobile screens */}
      <div className="hidden sm:flex absolute bottom-1 sm:bottom-2 md:bottom-4 left-0 right-0 justify-center space-x-1.5 sm:space-x-2">
        {displayProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full transition-all ${
              currentIndex === index ? 'bg-black scale-125' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}