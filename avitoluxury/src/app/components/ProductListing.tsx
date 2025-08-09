'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './store/ProductCard';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Nav from './Nav';
import Footer from './Footer';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  slug?: string;
  productType: string;
  price: number;
  comparePrice?: number;
  discountedPrice?: number;
  images?: string[] | { url: string }[];
  mainImage?: string;
  subCategories?: string[];
  volume?: string;
  gender?: string;
  isBestSelling?: boolean;
  isNewArrival?: boolean;
  isBestBuy?: boolean;
  featured?: boolean;
  tags?: string[];
  inStock?: boolean;
  quantity?: number;
  brand?: string;
  createdAt: string;
  updatedAt: string;
  ml?: number;
  category?: string;
  description?: string;
}

// ProductCardWrapper to handle different Product interfaces
const ProductCardWrapper = ({ product }: { product: Product }) => {
  // Format product to match ProductCard expectations
  const formattedProduct = {
    ...product,
    slug: product.slug || product._id,
    mainImage: product.mainImage || (Array.isArray(product.images) && product.images.length > 0 ? 
      (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as {url: string}).url) : 
      '/placeholder-image.jpg'),
    inStock: product.inStock !== undefined ? product.inStock : true
  };
  
  // Check if product has a valid discount - comparePrice is the original higher price
  const hasDiscount = 
    (formattedProduct.comparePrice && formattedProduct.comparePrice > formattedProduct.price) || 
    (formattedProduct.comparePrice && formattedProduct.comparePrice > 0 && formattedProduct.comparePrice < formattedProduct.price);
  
  // Add to cart handler
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Get existing cart from localStorage
      const existingCart = localStorage.getItem('cart') || '[]';
      const cart = JSON.parse(existingCart);
      
      // Check if product already exists in cart
      const existingItemIndex = cart.findIndex((item: any) => 
        item._id === formattedProduct._id || item.id === formattedProduct._id
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        cart[existingItemIndex].quantity += 1;
      } else {
        // Add new product to cart
        cart.push({
          _id: formattedProduct._id,
          id: formattedProduct._id,
          name: formattedProduct.name,
          price: formattedProduct.price,
          comparePrice: formattedProduct.comparePrice,
          image: formattedProduct.mainImage,
          quantity: 1
        });
      }
      
      // Save updated cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Trigger events to notify other components
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('cart-updated'));
      
      // Optional: Show a notification or feedback
      
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };
  
  const displayPrice = formattedProduct.price;
  const displayOriginalPrice = formattedProduct.comparePrice || 
    (formattedProduct.comparePrice ? formattedProduct.price : undefined);
  
  return (
    <div className="h-full flex flex-col bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300">
      <div className="relative overflow-hidden group">
        <Link href={`/product/${formattedProduct.slug}`}>
          <div className="relative w-full h-48 xs:h-56 sm:h-60 md:h-64">
            <Image 
              src={formattedProduct.mainImage} 
              alt={formattedProduct.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </Link>
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded">
            ON SALE
          </div>
        )}
      </div>
      <div className="p-3 xs:p-4 flex-grow flex flex-col">
        <h3 className="font-medium text-xs xs:text-sm md:text-base mb-1 font-lastica line-clamp-1">
          <Link href={`/product/${formattedProduct.slug}`} className="hover:text-gray-700 font-lastica">
            {formattedProduct.name}
          </Link>
        </h3>
        <p className="text-xs text-gray-600 mb-1">{formattedProduct.subCategories && formattedProduct.subCategories.length > 0 ? formattedProduct.subCategories[0] : ''}</p>
        <p className="text-xs text-gray-600 mb-1">{formattedProduct.productType}</p>

        <div className="mt-auto flex justify-between items-center">
          <div className="flex items-baseline">
            {hasDiscount ? (
              <>
                <span className="text-sm xs:text-base font-bold text-red-600">₹{displayOriginalPrice}</span>
                {displayOriginalPrice && (
                  <span className="text-xs text-gray-400 line-through ml-2">
                    MRP ₹{displayPrice}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm xs:text-base font-bold">₹{displayPrice}</span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {formattedProduct.volume && `${formattedProduct.volume} `}
          </div>
        </div>
        <button 
          onClick={handleAddToCart}
          className="mt-3 w-full bg-black text-white py-2 xs:py-2.5 sm:py-3 rounded-none hover:bg-gray-800 transition-colors text-xs xs:text-sm"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

interface ProductListingProps {
  category?: string;
  productType?: string;
  subCategory?: string;
  tag?: string;
  gender?: string;
  title: string;
  description?: string;
}

export default function ProductListing({
  category,
  productType,
  subCategory,
  tag,
  gender,
  title,
  description
}: ProductListingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isGenderOpen, setIsGenderOpen] = useState(true);
  const [isVolumeOpen, setIsVolumeOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Available filter options
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableGenders, setAvailableGenders] = useState<string[]>([]);
  const [availableVolumes, setAvailableVolumes] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Fetch products based on category, productType, subCategory, or tag
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (productType) params.append('productType', productType);
        if (subCategory) params.append('subCategory', subCategory);
        if (tag) params.append('tag', tag);
        if (gender) params.append('gender', gender);
        
        console.log('Fetching products with params:', Object.fromEntries(params.entries()));
        
        // Fetch products from API
        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        // Ensure data is an array of products
        const productsArray: Product[] = Array.isArray(data.products) ? data.products : [];
        setProducts(productsArray);
        
        // Extract filter options
        extractFilterOptions(productsArray);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setProducts([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [category, productType, subCategory, tag, gender]);
  
  // Helper function to extract filter options
  const extractFilterOptions = (products: Product[]) => {
    // Extract categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    setAvailableCategories(categories as string[]);
    
    // Extract gender values, filtering out undefined/null
    const genderValues = products.map(p => p.gender).filter(Boolean) as string[];
    const genders = [...new Set(genderValues)];
    setAvailableGenders(genders);
    
    // Extract volume values
    const volumeValues = products.map(p => p.volume).filter(Boolean) as string[];
    const volumes = [...new Set(volumeValues)];
    setAvailableVolumes(volumes);
    
    // Extract tags
    const allTags = products.flatMap(product => product.tags || []);
    const uniqueTags = [...new Set(allTags)];
    setAvailableTags(uniqueTags);
    
    // Find min and max price
    if (products.length > 0) {
      const prices = products.map(product => (product.discountedPrice && product.discountedPrice > 0) ? product.discountedPrice : product.price);
      const minPrice = Math.floor(Math.min(...prices)) || 0;
      const maxPrice = Math.ceil(Math.max(...prices)) || 10000;
      setPriceRange([minPrice, maxPrice]);
    }
  };
  
  // Apply filters and search
  const filteredProducts = products.filter(product => {
    // Filter by search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !(product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    
    // Filter by price range
    const price = (product.discountedPrice && product.discountedPrice > 0) ? product.discountedPrice : product.price;
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }
    
    // Filter by categories
    if (selectedCategories.length > 0 && 
        !(product.category && selectedCategories.includes(product.category))) {
      return false;
    }
    
    // Filter by gender
    if (selectedGender.length > 0 && 
        !(product.gender && selectedGender.includes(product.gender))) {
      return false;
    }
    
    // Filter by volume
    if (selectedVolume.length > 0 && 
        !(product.volume && selectedVolume.includes(product.volume))) {
      return false;
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0 && 
        !selectedTags.some(tag => product.tags?.includes(tag))) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort products
    switch (sortBy) {
      case 'price-low-high':
        const aPrice = (a.discountedPrice && a.discountedPrice > 0) ? a.discountedPrice : a.price;
        const bPrice = (b.discountedPrice && b.discountedPrice > 0) ? b.discountedPrice : b.price;
        return aPrice - bPrice;
      case 'price-high-low':
        const aPrice2 = (a.discountedPrice && a.discountedPrice > 0) ? a.discountedPrice : a.price;
        const bPrice2 = (b.discountedPrice && b.discountedPrice > 0) ? b.discountedPrice : b.price;
        return bPrice2 - aPrice2;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'name-a-z':
        return a.name.localeCompare(b.name);
      case 'name-z-a':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });
  
  // Toggle handlers
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
  
  const handleVolumeToggle = (volume: string) => {
    setSelectedVolume(prev => 
      prev.includes(volume)
        ? prev.filter(v => v !== volume)
        : [...prev, volume]
    );
  };
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedGender([]);
    setSelectedVolume([]);
    setSelectedTags([]);
    if (products.length > 0) {
      const prices = products.map(p => (p.discountedPrice && p.discountedPrice > 0) ? p.discountedPrice : p.price);
      const minPrice = Math.floor(Math.min(...prices)) || 0;
      const maxPrice = Math.ceil(Math.max(...prices)) || 10000;
      setPriceRange([minPrice, maxPrice]);
    }
    setSortBy('newest');
  };
  
  return (
    <>
      <Nav />
      <div className="container mx-auto px-4 py-8">
        {/* Hero header section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">{title}</h1>
          <div className="w-24 h-1 bg-black mx-auto mb-4"></div>
          {description && <p className="text-lg text-gray-600 max-w-3xl mx-auto">{description}</p>}
        </div>
        
        {/* Search and Filter Toggle */}
        <div className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="w-full md:w-2/3 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Filters Panel */}
          <div className={`${isFilterOpen ? 'block' : 'hidden lg:block'} w-full lg:w-1/4 transition-all duration-300`}>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 xs:p-4 mb-6 shadow-sm lg:sticky lg:top-24">
              <div className="flex justify-between items-center mb-3 xs:mb-5 pb-2 border-b border-gray-200">
                <h3 className="font-semibold text-base xs:text-lg">Filters</h3>
                <button 
                  onClick={resetFilters}
                  className="text-xs xs:text-sm text-black hover:text-gray-600 transition-colors"
                >
                  Reset All
                </button>
              </div>
              
              {/* Sort By */}
              <div className="border-t border-gray-200 py-3 xs:py-4">
                <h4 className="font-medium mb-2 text-sm xs:text-base">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="name-a-z">Name: A to Z</option>
                  <option value="name-z-a">Name: Z to A</option>
                </select>
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
                      min={0}
                      max={priceRange[1] || 10000}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>
                )}
              </div>
              
              {/* Categories */}
              {availableCategories.length > 0 && (
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
                      {availableCategories.map((cat) => (
                        <div key={cat} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`cat-${cat}`}
                            checked={selectedCategories.includes(cat)}
                            onChange={() => handleCategoryToggle(cat)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                          />
                          <label htmlFor={`cat-${cat}`} className="ml-2 text-sm">
                            {cat}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Gender */}
              {availableGenders.length > 0 && (
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
              )}
              
              {/* Volume/Size */}
              {availableVolumes.length > 0 && (
                <div className="border-t border-gray-200 py-4">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsVolumeOpen(!isVolumeOpen)}
                  >
                    <h4 className="font-medium">Size (ML)</h4>
                    {isVolumeOpen ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                  
                  {isVolumeOpen && (
                    <div className="mt-4 space-y-3">
                      {availableVolumes.map((volume) => (
                        <div key={volume} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`volume-${volume}`}
                            checked={selectedVolume.includes(volume)}
                            onChange={() => handleVolumeToggle(volume)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                          />
                          <label htmlFor={`volume-${volume}`} className="ml-2 text-sm">
                            {volume} 
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Tags */}
              {availableTags.length > 0 && (
                <div className="border-t border-gray-200 py-4">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsTagsOpen(!isTagsOpen)}
                  >
                    <h4 className="font-medium">Tags</h4>
                    {isTagsOpen ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                  
                  {isTagsOpen && (
                    <div className="mt-4 space-y-3">
                      {availableTags.map((tag) => (
                        <div key={tag} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`tag-${tag}`}
                            checked={selectedTags.includes(tag)}
                            onChange={() => handleTagToggle(tag)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                          />
                          <label htmlFor={`tag-${tag}`} className="ml-2 text-sm">
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="w-full lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-xl text-gray-800">Loading products...</p>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 md:gap-8">
                    {filteredProducts.map((product) => (
                      <div key={product._id} className="h-full">
                        <ProductCardWrapper product={product} />
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
      <Footer />
    </>
  );
}