'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import ProductCard from '../components/store/ProductCard';
import ShopNowButton from '../components/ui/ShopNowButton';
import { FiGift, FiCreditCard, FiPackage } from 'react-icons/fi';

// Define product type
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  category: string;
  images: { url: string }[];
  rating?: number;
  giftTags?: string[];
}

export default function GiftingPage() {
  const [giftProducts, setGiftProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const giftCategories = [
    { id: 'all', name: 'All Gifts' },
    { id: 'him', name: 'For Him' },
    { id: 'her', name: 'For Her' },
    { id: 'luxury', name: 'Luxury Gifts' },
    { id: 'budget', name: 'Under ₹1000' }
  ];
  
  useEffect(() => {
    // In a real app, fetch gift products from API
    // For now, use mock data
    const mockGiftProducts = [
      {
        _id: 'gift-1',
        name: 'Royal Oud Gift Box',
        description: 'Luxurious royal oud fragrance with wooden gift box and accessories',
        price: 3999,
        discountedPrice: 3499,
        category: 'Luxury',
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Royal+Oud+Gift' }],
        rating: 4.9,
        giftTags: ['luxury', 'him', 'bestseller']
      },
      {
        _id: 'gift-2',
        name: 'Floral Dreams Gift Set',
        description: 'Beautiful floral fragrance with matching body lotion in elegant packaging',
        price: 2499,
        discountedPrice: 0,
        category: 'For Her',
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Floral+Dreams+Set' }],
        rating: 4.7,
        giftTags: ['her', 'bestseller']
      },
      {
        _id: 'gift-3',
        name: 'Mini Collection Box',
        description: 'Set of 3 mini fragrances perfect for trying different scents',
        price: 999,
        discountedPrice: 899,
        category: 'Budget',
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Mini+Collection' }],
        rating: 4.5,
        giftTags: ['budget', 'unisex']
      },
      {
        _id: 'gift-4',
        name: 'Gentleman\'s Collection',
        description: 'Sophisticated woody scent with matching aftershave balm',
        price: 2999,
        discountedPrice: 2499,
        category: 'For Him',
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Gentlemans+Collection' }],
        rating: 4.8,
        giftTags: ['him']
      },
      {
        _id: 'gift-5',
        name: 'Diamond Edition Perfume',
        description: 'Our most exclusive fragrance in a crystal bottle with satin case',
        price: 5999,
        discountedPrice: 0,
        category: 'Luxury',
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Diamond+Edition' }],
        rating: 5.0,
        giftTags: ['luxury', 'her']
      },
      {
        _id: 'gift-6',
        name: 'Essential Oil Roll-On Set',
        description: 'Set of 5 essential oil roll-ons in a travel-friendly case',
        price: 899,
        discountedPrice: 799,
        category: 'Budget',
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Essential+Oils+Set' }],
        rating: 4.5,
        giftTags: ['budget', 'unisex']
      },
      {
        _id: 'gift-7',
        name: 'Luxury Gift Card',
        description: 'Let them choose their perfect scent with our premium gift card',
        price: 2000,
        discountedPrice: 0,
        category: 'Gift Cards',
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Gift+Card' }],
        rating: 4.9,
        giftTags: ['giftcard', 'luxury']
      },
      {
        _id: 'gift-8',
        name: 'Signature Scent Duo',
        description: 'Our bestselling his and hers fragrance pair in special packaging',
        price: 4999,
        discountedPrice: 3999,
        category: 'Luxury',
        images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Signature+Duo' }],
        rating: 4.8,
        giftTags: ['luxury', 'him', 'her']
      }
    ];
    
    setGiftProducts(mockGiftProducts);
  }, []);
  
  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'all' 
    ? giftProducts 
    : giftProducts.filter(product => product.giftTags?.includes(selectedCategory));

  return (
    <>
      <Nav />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="w-full h-[50vh] bg-gray-100 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-10 bg-black bg-opacity-30"></div>
          <img 
            src="https://placehold.co/1200x600/272420/FFFFFF?text=Perfect+Gifts" 
            alt="Gifting"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="text-center px-4 z-20 text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">The Perfect Gift</h1>
            <p className="text-lg max-w-lg mx-auto">
              Thoughtfully curated gifts that leave a lasting impression.
            </p>
            <div className="mt-6">
              <ShopNowButton href="#gift-collections" className="inline-block mx-auto" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Extraordinary Gifts for Every Occasion</h2>
          <p className="text-gray-600">
            Finding the perfect gift can be challenging, but we've made it simple. 
            Our curated gift sets are designed to impress, delight and create memorable moments.
          </p>
        </div>
        
        {/* Gift Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <FiGift className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Elegant Packaging</h3>
            <p className="text-gray-600">
              Each gift comes in sophisticated, premium packaging that makes an impression before it's even opened.
            </p>
          </div>
          
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <FiPackage className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Curated Collections</h3>
            <p className="text-gray-600">
              Our gift sets are thoughtfully designed with complementary products that work perfectly together.
            </p>
          </div>
          
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <FiCreditCard className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Gift Cards</h3>
            <p className="text-gray-600">
              Let them choose their perfect fragrance with our luxurious digital or physical gift cards.
            </p>
          </div>
        </div>
        
        {/* Featured Gift */}
        <div className="bg-gray-50 p-6 md:p-12 rounded-lg mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <img 
                  src="https://placehold.co/600x600/272420/FFFFFF?text=Limited+Edition+Gift+Box" 
                  alt="Limited Edition Gift Box"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <div>
              <span className="text-sm text-red-600 uppercase tracking-wider font-medium">Limited Edition</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-4">Luxury Gift Collection</h2>
              <p className="text-gray-600 mb-6">
                Our most exclusive gift set features our signature fragrance along with matching body lotion, 
                shower gel, and scented candle in a handcrafted wooden box.
              </p>
              
              <div className="mb-6 p-4 bg-white rounded border border-gray-200">
                <p className="text-gray-800 italic">
                  "The perfect gift for someone special. The presentation alone is worth every penny, 
                  and the products inside are simply divine." - Vogue Magazine
                </p>
              </div>
              
              <div className="flex items-center mb-6">
                <span className="text-2xl font-bold">₹4,999</span>
                <span className="ml-2 text-sm text-gray-500 line-through">₹5,999</span>
                <span className="ml-3 bg-black text-white text-xs px-2 py-1">Limited Stock</span>
              </div>
              
              <ShopNowButton href="/product/luxury-gift-collection" />
            </div>
          </div>
        </div>
        
        {/* Gift Collections */}
        <div id="gift-collections" className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Find the Perfect Gift</h2>
          
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {giftCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
        
        {/* Gift Card Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-50 p-6 md:p-12 rounded-lg">
            <div className="order-2 md:order-1">
              <h2 className="text-2xl font-bold mb-4">Gift Cards</h2>
              <p className="text-gray-600 mb-6">
                Not sure which fragrance they'll love? Let them choose with our elegant digital or physical gift cards. 
                Available in multiple denominations and delivered instantly or in premium packaging.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button className="py-2 border border-gray-200 rounded hover:border-black text-center">₹1000</button>
                <button className="py-2 border border-gray-200 rounded hover:border-black text-center">₹2000</button>
                <button className="py-2 border border-gray-200 rounded hover:border-black text-center">₹5000</button>
              </div>
              <ShopNowButton href="/gift-cards" />
            </div>
            <div className="order-1 md:order-2">
              <img 
                src="https://placehold.co/600x400/272420/FFFFFF?text=Gift+Cards" 
                alt="Gift Cards"
                className="w-full h-auto object-cover rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
        
        {/* Gifting Tips */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Fragrance Gifting Tips</h2>
          
          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Consider Their Style</h3>
              <p className="text-gray-600">
                Think about their personality and preferences. Are they bold and outgoing or subtle and refined? 
                Choose fragrances that match their style.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">When in Doubt, Choose Discovery Sets</h3>
              <p className="text-gray-600">
                If you're unsure about their preferences, a discovery set allows them to explore multiple fragrances 
                and find their perfect scent.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Consider the Occasion</h3>
              <p className="text-gray-600">
                Different occasions call for different gifts. Anniversary or Valentine's Day might warrant our luxury 
                collections, while birthdays might be perfect for our signature sets.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Add a Personal Touch</h3>
              <p className="text-gray-600">
                During checkout, you can add a personalized message to make your gift even more special and meaningful.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
} 