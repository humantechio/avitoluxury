'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import ShopNowButton from '../components/ui/ShopNowButton';
import { FiShoppingCart, FiPercent, FiPackage } from 'react-icons/fi';

interface ComboProduct {
  _id: string;
  name: string;
  description: string;
  originalPrice: number;
  comboPrice: number;
  savings: number;
  savingsPercent: number;
  image: string;
  includes: {
    name: string;
    price: number;
    size: string;
  }[];
}

export default function CombosPage() {
  const [combos, setCombos] = useState<ComboProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, fetch combo products from an API
    // For now, use mock data
    const mockCombos = [
      {
        _id: 'combo-1',
        name: 'His & Hers Collection',
        description: 'Perfect pair of complementary fragrances for couples',
        originalPrice: 3698,
        comboPrice: 2999,
        savings: 699,
        savingsPercent: 19,
        image: 'https://placehold.co/800x500/272420/FFFFFF?text=His+and+Hers+Collection',
        includes: [
          {
            name: 'Royal Oud for Him',
            price: 1899,
            size: '100ml'
          },
          {
            name: 'Golden Rose for Her',
            price: 1799,
            size: '100ml'
          }
        ]
      },
      {
        _id: 'combo-2',
        name: 'Office Essentials',
        description: 'Professional fragrances perfect for your workplace',
        originalPrice: 3099,
        comboPrice: 2499,
        savings: 600,
        savingsPercent: 19,
        image: 'https://placehold.co/800x500/272420/FFFFFF?text=Office+Essentials',
        includes: [
          {
            name: 'Business Casual Cologne',
            price: 1699,
            size: '50ml'
          },
          {
            name: 'Subtle Essence Perfume',
            price: 1400,
            size: '50ml'
          }
        ]
      },
      {
        _id: 'combo-3',
        name: 'Summer Party Pack',
        description: 'Refreshing fragrances for hot summer days and nights',
        originalPrice: 4497,
        comboPrice: 3499,
        savings: 998,
        savingsPercent: 22,
        image: 'https://placehold.co/800x500/272420/FFFFFF?text=Summer+Party+Pack',
        includes: [
          {
            name: 'Citrus Splash',
            price: 1499,
            size: '100ml'
          },
          {
            name: 'Ocean Breeze',
            price: 1699,
            size: '100ml'
          },
          {
            name: 'Tropical Nights',
            price: 1299,
            size: '50ml'
          }
        ]
      },
      {
        _id: 'combo-4',
        name: 'Luxury Gift Set',
        description: 'Premium fragrance with matching body lotion and shower gel',
        originalPrice: 2997,
        comboPrice: 2299,
        savings: 698,
        savingsPercent: 23,
        image: 'https://placehold.co/800x500/272420/FFFFFF?text=Luxury+Gift+Set',
        includes: [
          {
            name: 'Midnight Elixir Perfume',
            price: 1999,
            size: '50ml'
          },
          {
            name: 'Midnight Elixir Body Lotion',
            price: 599,
            size: '200ml'
          },
          {
            name: 'Midnight Elixir Shower Gel',
            price: 399,
            size: '200ml'
          }
        ]
      }
    ];
    
    setCombos(mockCombos);
    setLoading(false);
  }, []);

  return (
    <>
      <Nav />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="w-full h-[40vh] bg-gray-100 flex items-center justify-center">
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-gray-900 to-transparent opacity-70"></div>
          <img 
            src="https://placehold.co/1200x600/272420/FFFFFF?text=Special+Combos" 
            alt="Special Combos"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div className="text-center px-4 z-10 relative text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Special Combos</h1>
            <p className="text-lg md:text-xl max-w-lg mx-auto">
              Exclusive combinations at unbeatable prices
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Better Together, Better Value</h2>
          <p className="text-gray-600">
            Our specially curated combos offer the perfect opportunity to explore complementary fragrances 
            or complete your collection at a special price. Each combo is thoughtfully designed to enhance 
            your fragrance experience.
          </p>
        </div>
        
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <FiPercent className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Exclusive Savings</h3>
            <p className="text-gray-600">
              Save up to 25% compared to buying products individually.
            </p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <FiPackage className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Curated Combinations</h3>
            <p className="text-gray-600">
              Expertly paired fragrances and products that complement each other perfectly.
            </p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <FiShoppingCart className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
            <p className="text-gray-600">
              All combos come with complimentary standard shipping.
            </p>
          </div>
        </div>
        
        {/* Combo Listings */}
        <div className="space-y-16 mb-16">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : (
            combos.map(combo => (
              <div key={combo._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-5">
                  {/* Image - takes up 2/5 on large screens */}
                  <div className="lg:col-span-2">
                    <div className="relative h-full min-h-[250px]">
                      <img 
                        src={combo.image} 
                        alt={combo.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Savings Badge */}
                      <div className="absolute top-4 right-4 bg-black text-white px-3 py-2 rounded-full">
                        <span className="font-bold">Save {combo.savingsPercent}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Details - takes up 3/5 on large screens */}
                  <div className="lg:col-span-3 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{combo.name}</h3>
                      <p className="text-gray-600 mb-6">{combo.description}</p>
                      
                      <h4 className="text-lg font-medium mb-3">What's Included:</h4>
                      <div className="space-y-3 mb-6">
                        {combo.includes.map((item, index) => (
                          <div key={index} className="flex justify-between border-b border-gray-100 pb-2">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-gray-500 text-sm ml-2">({item.size})</span>
                            </div>
                            <div className="text-gray-500">₹{item.price.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-4">
                      <div>
                        <div className="flex items-center">
                          <span className="text-2xl font-bold">₹{combo.comboPrice.toLocaleString()}</span>
                          <span className="ml-2 text-sm text-gray-500 line-through">₹{combo.originalPrice.toLocaleString()}</span>
                        </div>
                        <p className="text-green-600 font-medium text-sm mt-1">
                          You save: ₹{combo.savings.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <ShopNowButton href={`/product/${combo._id}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Can I exchange a single product from a combo?</h3>
              <p className="text-gray-600">
                Unfortunately, combo products are sold as a set and individual items cannot be exchanged. 
                However, if there's a quality issue with any product in the combo, our customer service team will be happy to assist you.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Are combo deals available all year round?</h3>
              <p className="text-gray-600">
                Most combos are permanent offerings, but we also introduce limited-time seasonal combos. 
                Look for the "Limited Edition" tag to identify seasonal offerings.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Can I apply discount codes to combo purchases?</h3>
              <p className="text-gray-600">
                Combo products are already discounted, but most store-wide promotions will apply. 
                Some restrictions may apply to certain promotional codes.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Do you offer custom combos?</h3>
              <p className="text-gray-600">
                We don't currently offer custom combinations, but we're always open to suggestions! 
                Contact our customer service team if you have a specific combination in mind.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
} 