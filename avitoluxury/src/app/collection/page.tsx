'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import ProductCard from '../components/store/ProductCard';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  category: string;
  images: { url: string }[];
  rating: number;
  ml?: number;
  gender?: string;
}

export default function CollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedML, setSelectedML] = useState<number[]>([]);
  
  // UI states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isGenderOpen, setIsGenderOpen] = useState(true);
  const [isMLOpen, setIsMLOpen] = useState(true);
  
  // Available filter options (will be populated from products)
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableGenders, setAvailableGenders] = useState<string[]>([]);
  const [availableML, setAvailableML] = useState<number[]>([]);
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        const productsData = data.products || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Extract filter options
        extractFilterOptions(productsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        
        // Set some mock products for development
        const mockProducts = [
          {
            _id: '1',
            name: 'Midnight Elixir',
            description: 'Captivating blend of amber, vanilla, and musk for a mysterious allure',
            price: 199.99,
            discountedPrice: 149.99,
            category: 'Floral',
            images: [{ url: 'https://placehold.co/400x500/272420/FFFFFF?text=Midnight+Elixir' }],
            rating: 4.5,
            ml: 50,
            gender: 'unisex',
          },
          {
            _id: '2',
            name: 'Golden Aura',
            description: 'Luxurious notes of bergamot, jasmine, and sandalwood for timeless elegance',
            price: 299.99,
            discountedPrice: 249.99,
            category: 'Woody',
            images: [{ url: 'https://placehold.co/400x500/272420/FFFFFF?text=Golden+Aura' }],
            rating: 4.8,
            ml: 100,
            gender: 'male',
          },
          {
            _id: '3',
            name: 'Royal Oud',
            description: 'Opulent blend of oud wood, rose, and spices fit for royalty',
            price: 399.99,
            discountedPrice: 0,
            category: 'Oriental',
            images: [{ url: 'https://placehold.co/400x500/272420/FFFFFF?text=Royal+Oud' }],
            rating: 4.9,
            ml: 75,
            gender: 'male',
          },
          {
            _id: '4',
            name: 'Velvet Rose',
            description: 'Elegant blend of roses with subtle hints of patchouli',
            price: 229.99,
            discountedPrice: 199.99,
            category: 'Floral',
            images: [{ url: 'https://placehold.co/400x500/272420/FFFFFF?text=Velvet+Rose' }],
            rating: 4.6,
            ml: 50,
            gender: 'female',
          },
        ];
        
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
        
        // Extract filter options from mock products
        extractFilterOptions(mockProducts);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);
  
  // Helper function to extract filter options
  const extractFilterOptions = (products: Product[]) => {
    const categories = [...new Set(products.map(p => p.category))];
    
    // Extract gender values, filtering out undefined/null
    const genderValues = products.map(p => p.gender).filter(Boolean) as string[];
    const genders = [...new Set(genderValues)];
    
    // Extract ml values, filtering out undefined/null
    const mlValues = products.map(p => p.ml).filter(Boolean) as number[];
    const mlSizes = [...new Set(mlValues)];
    
    setAvailableCategories(categories);
    setAvailableGenders(genders);
    setAvailableML(mlSizes);
    
    // Find min and max price
    if (products.length > 0) {
      const prices = products.map(p => p.discountedPrice > 0 ? p.discountedPrice : p.price);
      const minPrice = Math.floor(Math.min(...prices)) || 0;
      const maxPrice = Math.ceil(Math.max(...prices)) || 5000;
      setPriceRange([minPrice, maxPrice]);
    }
  };
  
  // Apply filters when any filter changes
  useEffect(() => {
    // Filter products based on all criteria
    const filtered = products.filter(product => {
      // Search text match
      const searchMatch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category match
      const categoryMatch = selectedCategories.length === 0 || 
        selectedCategories.includes(product.category);
      
      // Gender match - check if product has a gender property and if it's in the selectedGender array
      const genderMatch = selectedGender.length === 0 || 
        (product.gender && selectedGender.includes(product.gender));
      
      // ML match - check if product has an ml property and if it's in the selectedML array
      const mlMatch = selectedML.length === 0 || 
        (product.ml && selectedML.includes(product.ml));
      
      // Price match
      const productPrice = product.discountedPrice > 0 ? product.discountedPrice : product.price;
      const priceMatch = productPrice >= priceRange[0] && productPrice <= priceRange[1];
      
      return searchMatch && categoryMatch && genderMatch && mlMatch && priceMatch;
    });
    
    setFilteredProducts(filtered);
    
  }, [searchQuery, selectedCategories, selectedGender, selectedML, priceRange, products]);
  
  // Handle category toggle
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  // Handle gender toggle
  const handleGenderToggle = (gender: string) => {
    setSelectedGender(prev => 
      prev.includes(gender) 
        ? prev.filter(g => g !== gender) 
        : [...prev, gender]
    );
  };
  
  // Handle ML toggle
  const handleMLToggle = (ml: number) => {
    setSelectedML(prev => 
      prev.includes(ml) 
        ? prev.filter(m => m !== ml) 
        : [...prev, ml]
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedGender([]);
    setSelectedML([]);
    if (products.length > 0) {
      const prices = products.map(p => p.discountedPrice > 0 ? p.discountedPrice : p.price);
      const minPrice = Math.floor(Math.min(...prices)) || 0;
      const maxPrice = Math.ceil(Math.max(...prices)) || 5000;
      setPriceRange([minPrice, maxPrice]);
    }
  };
  
  return (
    <div className="pb-10 bg-white text-black font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Hero header section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">Our Luxury Fragrance Collection</h1>
          <div className="w-24 h-1 bg-black mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover premium perfumes crafted with the finest ingredients from around the world.
          </p>
        </div>
        
        {/* Search and Filter Toggle */}
        <div className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="w-full md:w-2/3 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, or description..."
              className="w-full px-4 py-3 pl-10 rounded-md bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black focus:outline-none text-black"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-md transition duration-300 shadow-md"
          >
            <FiFilter />
            <span>{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Panel */}
          <div className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 shadow-sm sticky top-24">
              <div className="flex justify-between items-center mb-5 pb-2 border-b border-gray-200">
                <h3 className="font-semibold text-lg">Filters</h3>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-black hover:text-gray-600 transition-colors"
                >
                  Reset All
                </button>
              </div>
              
              {/* Price Range */}
              <div className="border-t border-gray-200 py-4">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setIsPriceOpen(!isPriceOpen)}
                >
                  <h4 className="font-medium">Price Range</h4>
                  {isPriceOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                
                {isPriceOpen && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-2 text-sm">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min={Math.min(...products.map(p => p.price)) || 0}
                      max={Math.max(...products.map(p => p.price)) || 5000}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>
                )}
              </div>
              
              {/* Categories */}
              <div className="border-t border-gray-200 py-4">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                >
                  <h4 className="font-medium">Categories</h4>
                  {isCategoryOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                
                {isCategoryOpen && (
                  <div className="mt-4 space-y-3">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`cat-${category}`}
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <label htmlFor={`cat-${category}`} className="ml-2 text-sm">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Gender */}
              <div className="border-t border-gray-200 py-4">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setIsGenderOpen(!isGenderOpen)}
                >
                  <h4 className="font-medium">Gender</h4>
                  {isGenderOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                
                {isGenderOpen && (
                  <div className="mt-4 space-y-3">
                    {/* Debug information to check available genders */}
                    {availableGenders.length === 0 && (
                      <p className="text-xs text-gray-500">No gender filters available</p>
                    )}
                    
                    {availableGenders.map((gender) => (
                      <div key={gender} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`gender-${gender}`}
                          checked={selectedGender.includes(gender)}
                          onChange={() => handleGenderToggle(gender)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <label htmlFor={`gender-${gender}`} className="ml-2 text-sm capitalize">
                          {gender}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* ML / Size */}
              <div className="border-t border-gray-200 py-4">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setIsMLOpen(!isMLOpen)}
                >
                  <h4 className="font-medium">Size (ML)</h4>
                  {isMLOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                
                {isMLOpen && (
                  <div className="mt-4 space-y-3">
                    {/* Debug information to check available sizes */}
                    {availableML.length === 0 && (
                      <p className="text-xs text-gray-500">No size filters available</p>
                    )}
                    
                    {availableML.map((ml) => (
                      <div key={ml} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`ml-${ml}`}
                          checked={selectedML.includes(ml)}
                          onChange={() => handleMLToggle(ml)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <label htmlFor={`ml-${ml}`} className="ml-2 text-sm">
                          {ml} ML
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-xl text-gray-800">Loading fragrances...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-5 rounded-lg mb-6" role="alert">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
                  <p className="text-gray-700">
                    Showing <span className="text-black font-medium">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'product' : 'products'}
                  </p>
                </div>
                
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => (
                      <div key={product._id} className="h-full">
                        <div className="h-full flex flex-col bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300">
                          <ProductCard product={product} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                    <svg className="h-16 w-16 mx-auto mb-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xl text-gray-800 mb-2">No products match your filters.</p>
                    <p className="text-gray-600 mb-5">Try adjusting your filter criteria.</p>
                    <button 
                      onClick={resetFilters}
                      className="px-6 py-2 bg-black text-white hover:bg-gray-800 rounded transition duration-300 shadow-md"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 