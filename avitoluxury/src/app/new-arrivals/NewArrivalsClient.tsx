'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import ShopNowButton from '../components/ui/ShopNowButton';
import { FiBell, FiClock, FiCalendar } from 'react-icons/fi';

interface NewProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  launchDate: string; // ISO date string
  category: string;
  highlights: string[];
  preorderAvailable: boolean;
}

export default function NewArrivalsClient() {
  const [upcomingProducts, setUpcomingProducts] = useState<NewProduct[]>([]);
  const [countdowns, setCountdowns] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  
  useEffect(() => {
    // In a real application, fetch upcoming products from an API
    // For now, use mock data with future dates
    const mockProducts = [
      {
        _id: 'upcoming-1',
        name: 'Velvet Noir',
        description: 'A mysterious and seductive fragrance with notes of black cherry, dark chocolate, and vanilla bourbon.',
        price: 2499,
        image: 'https://placehold.co/600x800/272420/FFFFFF?text=Velvet+Noir',
        launchDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
        category: 'Exclusive',
        highlights: [
          'Rich and decadent scent profile',
          'Long-lasting performance',
          'Handcrafted in small batches',
          'Luxurious black glass bottle'
        ],
        preorderAvailable: true
      },
      {
        _id: 'upcoming-2',
        name: 'Ocean Mist Collection',
        description: 'Inspired by coastal breezes, this collection brings the freshness of the ocean to your everyday life.',
        price: 1899,
        image: 'https://placehold.co/600x800/272420/FFFFFF?text=Ocean+Mist',
        launchDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days from now
        category: 'Collection',
        highlights: [
          'Unisex fragrance suitable for all ages',
          'Aquatic notes with hints of sea salt',
          'Eco-friendly packaging',
          'Available in 50ml and 100ml bottles'
        ],
        preorderAvailable: true
      },
      {
        _id: 'upcoming-3',
        name: 'Amber & Cashmere',
        description: 'A warm, sophisticated fragrance that wraps you in comfort with notes of amber, cashmere wood, and vanilla.',
        price: 3299,
        image: 'https://placehold.co/600x800/272420/FFFFFF?text=Amber+Cashmere',
        launchDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
        category: 'Premium',
        highlights: [
          'Rich and warm fragrance notes',
          'Perfect for evening wear',
          'Sustainable sourcing practices',
          'Exclusive crystal bottle design'
        ],
        preorderAvailable: true
      },
      {
        _id: 'upcoming-4',
        name: 'Cedar & Sage',
        description: 'A grounding and earthy fragrance with woody notes of cedar paired with fresh sage and citrus top notes.',
        price: 1999,
        image: 'https://placehold.co/600x800/272420/FFFFFF?text=Cedar+Sage',
        launchDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
        category: 'Organic',
        highlights: [
          '100% natural ingredients',
          'Certified organic essential oils',
          'Recyclable packaging',
          'Unisex appeal'
        ],
        preorderAvailable: false
      },
      {
        _id: 'upcoming-5',
        name: 'Summer Solstice',
        description: 'Capture the essence of summer with this vibrant blend of tropical fruits, white flowers, and warm amber.',
        price: 1799,
        image: 'https://placehold.co/600x800/272420/FFFFFF?text=Summer+Solstice',
        launchDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days from now
        category: 'Limited Edition',
        highlights: [
          'Limited summer release',
          'Bright and cheerful scent profile',
          'Special edition packaging',
          'Perfect for daytime wear'
        ],
        preorderAvailable: true
      }
    ];
    
    setUpcomingProducts(mockProducts);
    setLoading(false);
  }, []);
  
  // Update countdowns every second
  useEffect(() => {
    if (upcomingProducts.length === 0) return;
    
    const updateCountdowns = () => {
      const now = new Date().getTime();
      const newCountdowns: {[key: string]: string} = {};
      
      upcomingProducts.forEach(product => {
        const launchTime = new Date(product.launchDate).getTime();
        const timeLeft = launchTime - now;
        
        if (timeLeft <= 0) {
          newCountdowns[product._id] = 'Now Available!';
        } else {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          
          newCountdowns[product._id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
      });
      
      setCountdowns(newCountdowns);
    };
    
    // Initial update
    updateCountdowns();
    
    // Set interval for updates
    const intervalId = setInterval(updateCountdowns, 1000);
    
    // Cleanup interval
    return () => clearInterval(intervalId);
  }, [upcomingProducts]);
  
  const filterProducts = (products: NewProduct[]) => {
    if (activeFilter === 'all') {
      return products;
    }
    return products.filter(product => product.category === activeFilter);
  };
  
  const categories = ['all', ...new Set(upcomingProducts.map(p => p.category))];
  
  return (
    <>
      <Nav />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="w-full h-[50vh] bg-gray-100 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 bg-black bg-opacity-50"></div>
          <img 
            src="https://placehold.co/1200x600/272420/FFFFFF?text=Coming+Soon" 
            alt="New Arrivals"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div className="text-center px-4 z-10 relative text-white">
            <span className="inline-block bg-black text-white px-4 py-1 text-sm font-medium mb-4">
              NEW ARRIVALS
            </span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Coming Soon</h1>
            <p className="text-lg md:text-xl max-w-lg mx-auto">
              Be the first to discover our newest fragrance creations
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Discover What's Coming</h2>
          <p className="text-gray-600">
            We're constantly innovating and creating new fragrances to delight your senses. 
            Preview our upcoming releases and set reminders so you don't miss out on these exclusive launches.
          </p>
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(category => (
            <button 
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-4 py-2 rounded-full text-sm ${
                activeFilter === category 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Upcoming Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : (
            filterProducts(upcomingProducts).map(product => (
              <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Product Image */}
                  <div className="relative overflow-hidden h-full min-h-[350px]">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs font-medium">
                      {product.category}
                    </div>
                  </div>
                  
                  {/* Product Details */}
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2 font-lastica">{product.name}</h3>
                      <p className="text-gray-600 mb-4 ">{product.description}</p>
                      
                      {/* Countdown Timer */}
                      <div className="mb-4">
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <FiCalendar className="mr-1" /> Launch Date: {new Date(product.launchDate).toLocaleDateString()}
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg flex items-center">
                          <FiClock className="text-black mr-2" />
                          <div>
                            <span className="text-xs uppercase text-gray-500 block">Launching in</span>
                            <span className="font-mono font-bold">{countdowns[product._id]}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Product Highlights */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Highlights:</h4>
                        <ul className="space-y-1 text-sm">
                          {product.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block w-2 h-2 bg-black rounded-full mt-1.5 mr-2"></span>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-3">
                        <span className="text-xl font-bold">₹{product.price.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex gap-3">
                        {product.preorderAvailable ? (
                          <ShopNowButton href={`/product/${product._id}`} className="flex-1" />
                        ) : (
                          <button className="bg-gray-200 text-gray-800 px-8 py-3 rounded-md flex items-center justify-center hover:bg-gray-300 transition-colors flex-1">
                            Notify Me
                          </button>
                        )}
                        <button className="border border-black p-3 rounded-md hover:bg-gray-100">
                          <FiBell />
                        </button>
                      </div>
                      {product.preorderAvailable && (
                        <p className="text-xs text-gray-500 mt-2">Pre-order now to be first to receive</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {filterProducts(upcomingProducts).length === 0 && !loading && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No upcoming products in this category at the moment. Check back soon!</p>
            </div>
          )}
        </div>
        
        {/* Newsletter Section */}
        <div className="bg-gray-100 p-8 rounded-lg max-w-3xl mx-auto mb-16">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Stay Updated</h2>
            <p className="text-gray-600">
              Subscribe to our newsletter to be the first to know about new launches, 
              exclusive previews, and early access opportunities.
            </p>
          </div>
          
          <form className="flex flex-col md:flex-row md:space-x-4">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black mb-3 md:mb-0"
              required
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
        
        {/* Launch Process */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Our Launch Process</h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>
            
            {/* Timeline Items */}
            <div className="grid grid-cols-9 gap-4 mb-12 relative z-10">
              <div className="col-span-4 text-right pr-4">
                <h3 className="font-bold mb-2">Announcement</h3>
                <p className="text-gray-600 text-sm">
                  We reveal our upcoming fragrance with essential details and launch date.
                </p>
              </div>
              <div className="col-span-1 flex justify-center">
                <div className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center">1</div>
              </div>
              <div className="col-span-4"></div>
            </div>
            
            <div className="grid grid-cols-9 gap-4 mb-12 relative z-10">
              <div className="col-span-4"></div>
              <div className="col-span-1 flex justify-center">
                <div className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center">2</div>
              </div>
              <div className="col-span-4 pl-4">
                <h3 className="font-bold mb-2">Pre-Order Period</h3>
                <p className="text-gray-600 text-sm">
                  Secure your purchase before the official launch with exclusive pre-order benefits.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-9 gap-4 mb-12 relative z-10">
              <div className="col-span-4 text-right pr-4">
                <h3 className="font-bold mb-2">Preview Events</h3>
                <p className="text-gray-600 text-sm">
                  Exclusive in-store previews where select customers can experience the fragrance early.
                </p>
              </div>
              <div className="col-span-1 flex justify-center">
                <div className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center">3</div>
              </div>
              <div className="col-span-4"></div>
            </div>
            
            <div className="grid grid-cols-9 gap-4 relative z-10">
              <div className="col-span-4"></div>
              <div className="col-span-1 flex justify-center">
                <div className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center">4</div>
              </div>
              <div className="col-span-4 pl-4">
                <h3 className="font-bold mb-2">Official Launch</h3>
                <p className="text-gray-600 text-sm">
                  The fragrance becomes available to everyone, both online and in stores.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
} 