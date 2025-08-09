'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiArrowLeft } from 'react-icons/fi';
import ProductCard from '../components/store/ProductCard';
import Nav from '@/app/components/Nav';
import Footer from '@/app/components/Footer';

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
  ml?: number;
  gender?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams?.get('q') || '';
  const type = searchParams?.get('type') || 'all';
  const categoryParam = searchParams?.get('category') || '';
  
  // Function to handle the back button click
  const handleBackClick = () => {
    router.back();
  };
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(query);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedML, setSelectedML] = useState<number[]>([]);
  
  // UI states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isGenderOpen, setIsGenderOpen] = useState(true);
  const [isMLOpen, setIsMLOpen] = useState(true);
  
  // Available filter options
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableGenders, setAvailableGenders] = useState<string[]>([]);
  const [availableML, setAvailableML] = useState<number[]>([]);
  
  // Fetch products using the search API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        
        // Construct API URL with search parameters
        let apiUrl = `/api/search?q=${encodeURIComponent(query)}`;
        
        if (type && type !== 'all') {
          apiUrl += `&type=${encodeURIComponent(type)}`;
        }
        
        if (categoryParam) {
          apiUrl += `&category=${encodeURIComponent(categoryParam)}`;
        }
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load products');
        }
        
        const productsData = data.products || [];
        setProducts(productsData);
        
        // Extract filter options
        extractFilterOptions(productsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        
        // Set mock products for development
        const mockProducts = [
          {
            _id: '1',
            name: 'Midnight Elixir',
            description: 'Captivating blend of amber, vanilla, and musk for a mysterious allure',
            price: 199.99,
            discountedPrice: 149.99,
            category: 'Floral',
            productType: 'Perfumes',
            subCategory: 'Luxury',
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
            productType: 'Perfumes',
            subCategory: 'Premium',
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
            productType: 'Perfumes',
            subCategory: 'Luxury',
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
            productType: 'Perfumes',
            subCategory: 'Premium',
            images: [{ url: 'https://placehold.co/400x500/272420/FFFFFF?text=Velvet+Rose' }],
            rating: 4.6,
            ml: 50,
            gender: 'female',
          },
        ];
        
        setProducts(mockProducts);
        
        // Extract filter options from mock products
        extractFilterOptions(mockProducts);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, [query, type, categoryParam]);
  
  // Helper function to extract filter options
  const extractFilterOptions = (products: Product[]) => {
    const categories = [...new Set(products.map(p => p.category))];
    const genders = [...new Set(products.map(p => p.gender).filter(Boolean))];
    const mlValues = [...new Set(products.map(p => p.ml).filter(Boolean))];
    
    setAvailableCategories(categories);
    setAvailableGenders(genders as string[]);
    setAvailableML(mlValues as number[]);
    
    // Find min and max price
    if (products.length > 0) {
      const prices = products.map(p => p.discountedPrice > 0 ? p.discountedPrice : p.price);
      const minPrice = Math.floor(Math.min(...prices)) || 0;
      const maxPrice = Math.ceil(Math.max(...prices)) || 5000;
      setPriceRange([minPrice, maxPrice]);
    }
  };
  
  // Apply filters when any filter changes or on initial load
  useEffect(() => {
    if (products.length === 0) return;
    
    // Filter products based on all criteria
    const filtered = products.filter(product => {
      // Search text match - we already filtered by search query from the API
      // but this allows for additional filtering on the client side
      const searchMatch = searchQuery === '' || query === searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.gender && product.gender.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.ml && String(product.ml).includes(searchQuery));
      
      // Category match
      const categoryMatch = selectedCategories.length === 0 || 
        selectedCategories.includes(product.category);
      
      // Gender match
      const genderMatch = selectedGender.length === 0 || 
        (product.gender && selectedGender.includes(product.gender));
      
      // ML match
      const mlMatch = selectedML.length === 0 || 
        (product.ml && selectedML.includes(product.ml));
      
      // Price match
      const productPrice = product.discountedPrice > 0 ? product.discountedPrice : product.price;
      const priceMatch = productPrice >= priceRange[0] && productPrice <= priceRange[1];
      
      return searchMatch && categoryMatch && genderMatch && mlMatch && priceMatch;
    });
    
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategories, selectedGender, selectedML, priceRange, products, query]);
  
  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=all`);
    }
  };
  
  // Handlers for filter toggles
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  const handleGenderToggle = (gender: string) => {
    setSelectedGender(prev => 
      prev.includes(gender) 
        ? prev.filter(g => g !== gender) 
        : [...prev, gender]
    );
  };
  
  const handleMLToggle = (ml: number) => {
    setSelectedML(prev => 
      prev.includes(ml) 
        ? prev.filter(m => m !== ml) 
        : [...prev, ml]
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery(query);
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
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-grow">
        <div className="pb-10 bg-white text-black">
          <div className="container mx-auto px-4 py-8">
            {/* Back button */}
            <div className="mb-6">
              <button
                onClick={handleBackClick}
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                <span>Back</span>
              </button>
            </div>
            
            {/* SEO-friendly header */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 text-black">
                Search Results{query ? ` for "${query}"` : ''}
              </h1>
              <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Find your perfect fragrance from our exclusive collection of premium perfumes.
              </p>
            </div>
            
            {/* Search and Filter Toggle */}
            <div className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-center bg-[#30231d]/50 p-4 rounded-lg border border-[#b8860b]/20">
              <div className="w-full md:w-2/3 relative">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, category, gender or size..."
                    className="w-full px-4 py-3 pl-10 rounded-md bg-[#322920] border border-[#b8860b]/30 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none text-white"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                    <FiSearch />
                  </button>
                </form>
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#b8860b] to-[#d4af37] hover:from-[#a67c00] hover:to-[#b8860b] rounded-md transition duration-300 shadow-md"
              >
                <FiFilter />
                <span>{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
              </button>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Panel */}
              <div className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-gradient-to-b from-[#30231d] to-[#30231d]/80 border border-[#b8860b]/30 rounded-lg p-4 mb-6 shadow-lg sticky top-24">
                  <div className="flex justify-between items-center mb-5 pb-2 border-b border-[#b8860b]/30">
                    <h3 className="font-semibold text-lg text-[#d4af37]">Filters</h3>
                    <button 
                      onClick={resetFilters}
                      className="text-sm text-[#b8860b] hover:text-[#d4af37] transition-colors"
                    >
                      Reset All
                    </button>
                  </div>
                  
                  {/* Price Range */}
                  <div className="border-t border-[#b8860b]/20 py-4">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsPriceOpen(!isPriceOpen)}
                    >
                      <h4 className="font-medium text-[#d4af37]">Price Range</h4>
                      {isPriceOpen ? <FiChevronUp className="text-[#d4af37]" /> : <FiChevronDown className="text-[#d4af37]" />}
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
                          className="w-full h-2 bg-[#b8860b]/30 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Categories */}
                  <div className="border-t border-[#b8860b]/20 py-4">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    >
                      <h4 className="font-medium text-[#d4af37]">Categories</h4>
                      {isCategoryOpen ? <FiChevronUp className="text-[#d4af37]" /> : <FiChevronDown className="text-[#d4af37]" />}
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
                              className="w-4 h-4 rounded border-[#b8860b] text-[#d4af37] focus:ring-[#b8860b]"
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
                  <div className="border-t border-[#b8860b]/20 py-4">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsGenderOpen(!isGenderOpen)}
                    >
                      <h4 className="font-medium text-[#d4af37]">Gender</h4>
                      {isGenderOpen ? <FiChevronUp className="text-[#d4af37]" /> : <FiChevronDown className="text-[#d4af37]" />}
                    </div>
                    
                    {isGenderOpen && (
                      <div className="mt-4 space-y-3">
                        {availableGenders.map((gender) => (
                          <div key={gender} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`gender-${gender}`}
                              checked={selectedGender.includes(gender)}
                              onChange={() => handleGenderToggle(gender)}
                              className="w-4 h-4 rounded border-[#b8860b] text-[#d4af37] focus:ring-[#b8860b]"
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
                  <div className="border-t border-[#b8860b]/20 py-4">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsMLOpen(!isMLOpen)}
                    >
                      <h4 className="font-medium text-[#d4af37]">Size (ML)</h4>
                      {isMLOpen ? <FiChevronUp className="text-[#d4af37]" /> : <FiChevronDown className="text-[#d4af37]" />}
                    </div>
                    
                    {isMLOpen && (
                      <div className="mt-4 space-y-3">
                        {availableML.map((ml) => (
                          <div key={ml} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`ml-${ml}`}
                              checked={selectedML.includes(ml)}
                              onChange={() => handleMLToggle(ml)}
                              className="w-4 h-4 rounded border-[#b8860b] text-[#d4af37] focus:ring-[#b8860b]"
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
                  <div className="flex justify-center items-center h-64 bg-[#30231d]/30 rounded-lg border border-[#b8860b]/20">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-[#b8860b] border-t-[#d4af37] rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-xl text-black">Loading fragrances...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-red-900/20 border border-red-400 text-white px-6 py-5 rounded-lg mb-6" role="alert">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <div className="flex justify-between items-center mb-6 pb-2 border-b border-[#b8860b]/20">
                      <p className="text-gray-600">
                        Showing <span className="text-[#d4af37] font-medium">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'product' : 'products'}
                      </p>
                    </div>
                    
                    {filteredProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => (
                          <div key={product._id} className="h-full">
                            <div className="h-full flex flex-col bg-[#30231d] border border-[#b8860b]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#d4af37]/50">
                              <ProductCard product={product} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-[#30231d]/50 rounded-lg border border-[#b8860b]/20">
                        <svg className="h-16 w-16 mx-auto mb-4 text-[#b8860b]/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xl text-black mb-2">No products match your search criteria.</p>
                        <p className="text-gray-600 mb-5">Try different keywords or filter options.</p>
                        <button 
                          onClick={resetFilters}
                          className="px-6 py-2 bg-gradient-to-r from-[#b8860b] to-[#d4af37] hover:from-[#a67c00] hover:to-[#b8860b] rounded transition duration-300 shadow-md"
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
      </main>
      <Footer />
    </div>
  );
} 