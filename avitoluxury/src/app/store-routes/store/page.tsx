'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '../../components/store/ProductCard';
import SaleCarousel from '@/app/components/SaleCarousel';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  category: string;
  images: { url: string }[];
  rating: number;
  featured: boolean;
  new_arrival: boolean;
  best_seller: boolean;
  productType: string; // Add productType to fix the linter error
}

// Add this helper function to convert prices from USD to INR
const convertToRupees = (dollarPrice: number) => {
  // Just return the original price without conversion
  return dollarPrice;
};

// Helper function to safely get image URL from product
const getProductImage = (product: any): string => {
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') {
      return firstImage;
    } else if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
      return firstImage.url;
    }
  }
  
  return product.mainImage || 'https://placehold.co/400x500';
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [topSelling, setTopSelling] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch real products from API
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        let products = data.products.map((product: any) => ({
          ...product,
          price: convertToRupees(product.price),
          discountedPrice: product.comparePrice ? convertToRupees(product.comparePrice) : 0,
          // Map MongoDB fields to store-expected fields
          featured: product.featured || false,
          new_arrival: product.isNewArrival || false, // Use isNewArrival from MongoDB
          best_seller: product.isBestSelling || false, // Use isBestSelling field directly
          productType: product.productType || 'perfume', // Add productType with default value
          images: [{ url: getProductImage(product) }]
        }));
        
        // Filter products correctly by their flags - ensure boolean comparison
        const featured = products.filter((p: any) => p.featured === true);
        const newArrival = products.filter((p: any) => p.new_arrival === true || p.category?.includes('New Arrival'));
        const bestSeller = products.filter((p: any) => p.best_seller === true || p.category?.includes('Bestseller'));
        
        // Set products for each section
        setFeaturedProducts(featured);
        setNewArrivals(newArrival);
        setTopSelling(bestSeller);
        
      } catch (error) {
        console.error('Error fetching products:', error);
        // Don't expose error details
        setFeaturedProducts([]);
        setNewArrivals([]);
        setTopSelling([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  return (
    <div className="pb-10 bg-white text-black">
      {/* Sale Carousel */}
      <SaleCarousel />
      
      {/* Featured Products */}
      <section className="py-10 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-medium mb-8 text-center">Featured Products</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">No featured products available</p>
            )}
          </div>
        )}
        
        <div className="text-center mt-8">
          <Link href="/collection" className="inline-block border border-black px-6 py-2 hover:bg-black hover:text-white transition duration-300">
            View All Products
          </Link>
        </div>
      </section>
      
      {/* New Arrivals */}
      <section className="py-10 px-4 max-w-7xl mx-auto bg-gray-50">
        <h2 className="text-2xl md:text-3xl font-medium mb-8 text-center">New Arrivals</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.length > 0 ? (
              newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">No new arrivals available</p>
            )}
          </div>
        )}
        
        <div className="text-center mt-8">
          <Link href="/new-arrivals" className="inline-block border border-black px-6 py-2 hover:bg-black hover:text-white transition duration-300">
            View All New Arrivals
          </Link>
        </div>
      </section>
      
      {/* Best Selling */}
      <section className="py-10 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-medium mb-8 text-center">Best Selling</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {topSelling.length > 0 ? (
              topSelling.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">No best selling products available</p>
            )}
          </div>
        )}
        
        <div className="text-center mt-8">
          <Link href="/best-selling" className="inline-block border border-black px-6 py-2 hover:bg-black hover:text-white transition duration-300">
            View All Best Sellers
          </Link>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl md:text-2xl font-medium mb-2">About</h3>
            <h2 className="text-2xl md:text-3xl font-medium mb-4 whitespace-pre"> A V I T O    S C E N T S</h2>

            <p className="text-gray-600 mb-8">
            AVITO is a luxury brand renowned for its exquisite collection of premium perfumes, organic aromatic fragrances, and high-end bath and skincare products. Crafted with the finest natural and certified ingredients, AVITO’s offerings embody sophistication and indulgence, delivering long-lasting scents and nourishing care. Inspired by elegance and sustainability, the brand creates cruelty-free, paraben-free, and alcohol-free products, blending global expertise with timeless luxury to elevate everyday rituals.
            </p>
            <Link href="/about-us" className="inline-block border border-black px-6 py-2 hover:bg-black hover:text-white transition duration-300">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 