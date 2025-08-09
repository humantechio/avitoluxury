'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiMenu, FiX, FiChevronDown, FiSearch, FiShoppingBag, FiMoreVertical, FiArrowLeft } from 'react-icons/fi';
import MiniCartWithModal from './MiniCartWithModal';

// Define interfaces for component props and state
interface NavItem {
  id: string;
  name: string;
  enabled: boolean;
  path: string;
}

interface StoreComponent {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

interface DropdownItem {
  name: string;
  path: string;
}

interface NavigationItem {
  id: string;
  name: string;
  path: string;
  hasDropdown: boolean;
  dropdownItems?: DropdownItem[];
}

// Define a type for the navigation items state
interface NavItems {
  [key: string]: boolean;
  home: boolean;
  collection: boolean;
  perfumes: boolean;
  him: boolean;
  her: boolean;
  unisex: boolean;
  attars: boolean;
  fresheners: boolean;
  waxfume: boolean;
  about: boolean;
  track: boolean;
  contact: boolean;
}

// Define a type for component settings
interface ComponentSettings {
  [key: string]: boolean;
  search: boolean;
  miniCart: boolean;
  announcement: boolean;
}

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOptionsOpen, setMobileOptionsOpen] = useState(false);
  
  // Refs for dropdown elements
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Store navigation items
  const [navItems, setNavItems] = useState<NavItems>({
    home: true,
    collection: true,
    perfumes: true,
    him: true,
    her: true,
    unisex: true,
    attars: true,
    fresheners: true,
    waxfume: true,
    about: true,
    track: true,
    contact: true
  });
  
  // Store component settings
  const [componentSettings, setComponentSettings] = useState<ComponentSettings>({
    search: true,
    miniCart: true,
    announcement: true
  });
  
  // Fetch layout settings from API
  useEffect(() => {
    const fetchLayoutSettings = async () => {
      try {
        const response = await fetch('/api/layout/products');
        if (response.ok) {
          const data = await response.json();
          
          // Update navigation items based on API response
          if (data.navItems) {
            setNavItems(prev => ({
              ...prev,
              ...data.navItems
            }));
          }
          
          // Update component settings based on API response
          if (data.components) {
            setComponentSettings(prev => ({
              ...prev,
              ...data.components
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching layout settings:', error);
      }
    };
    
    fetchLayoutSettings();
  }, []);
  
  // Get cart items count from localStorage
  useEffect(() => {
    const getCartCount = () => {
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          if (Array.isArray(parsedCart)) {
            // Count total items in cart
            const totalItems = parsedCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            setCartItemsCount(totalItems);
          } else {
            setCartItemsCount(0);
          }
        } else {
          setCartItemsCount(0);
        }
      } catch (error) {
        console.error('Error loading cart count:', error);
        setCartItemsCount(0);
      }
    };
    
    // Initial count
    getCartCount();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      getCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events
    window.addEventListener('cart-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleStorageChange);
    };
  }, []);
  
  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && 
          dropdownRefs.current[activeDropdown] && 
          !dropdownRefs.current[activeDropdown]?.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);
  
  // Focus search input when search is opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);
  
  // Handle open mini cart from other components
  useEffect(() => {
    const handleOpenMiniCart = () => {
      setMiniCartOpen(true);
    };
    
    window.addEventListener('open-minicart', handleOpenMiniCart);
    
    const checkForCheckoutFlag = () => {
      try {
        const checkoutComplete = localStorage.getItem('checkout_complete');
        if (checkoutComplete === 'true') {
          // Clear the flag
          localStorage.removeItem('checkout_complete');
          
          // Show mini cart with success message
          setMiniCartOpen(true);
        }
      } catch (error) {
        console.error('Error checking checkout flag:', error);
      }
    };
    
    // Check for checkout flag on mount
    checkForCheckoutFlag();
    
    // Also check when storage changes
    window.addEventListener('storage', checkForCheckoutFlag);
    
    return () => {
      window.removeEventListener('open-minicart', handleOpenMiniCart);
      window.removeEventListener('storage', checkForCheckoutFlag);
    };
  }, []);
  
  // Disable background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      // Save the current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position when menu is closed
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }
    
    return () => {
      // Clean up in case component unmounts while menu is open
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [mobileMenuOpen]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setMobileOptionsOpen(false);
  };
  
  const toggleMobileOptions = () => {
    setMobileOptionsOpen(!mobileOptionsOpen);
  };
  
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };
  
  const handleDropdownHover = (id: string) => {
    setActiveDropdown(id);
  };
  
  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };
  
  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };
  
  const toggleMiniCart = () => {
    setMiniCartOpen(!miniCartOpen);
  };
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=all`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };
  
  // Handle category search
  const handleCategorySearch = (category: string) => {
    router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=category&category=${encodeURIComponent(category)}`);
    setSearchOpen(false);
    setSearchQuery('');
  };
  
  // Navigation items configuration
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      name: 'HOME',
      path: '/store-routes',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Best Selling', path: '/best-selling' },
        { name: 'New Arrivals', path: '/new-arrivals' },
        { name: 'Best Buy', path: '/best-buy' },
        { name: 'Him', path: '/him' },
        { name: 'Her', path: '/her' },
        { name: 'Unisex', path: '/unisex' }
      ]
    },
    // {
    //   id: 'collection',
    //   name: 'Collection',
    //   path: '/collection',
    //   hasDropdown: false,

    // },
    {
      id: 'perfumes',
      name: 'Perfumes',
      path: '/perfumes',
      hasDropdown: true,
      dropdownItems: [

 
        {
          name: 'Luxury Collection',
          path: '/perfumes/luxury'
        },
        {
          name: 'Premium Collection',
          path: '/perfumes/premium'
        },
        {
          name: 'Value For Money',
          path: '/perfumes/value-for-money'
        },
        {
          name: 'Combo Offers',
          path: '/perfumes/combo'
        }
      ]
    },
    {
      id: 'attars',
      name: 'Aesthetic Attars',
      path: '/aesthetic-attars',
      hasDropdown: true,
      dropdownItems: [

        {
          name: 'Premium Attars',
          path: '/aesthetic-attars/premium'
        },
        {
          name: 'Luxury Attars',
          path: '/aesthetic-attars/luxury'
        },
        {
          name: 'Combo Offers',
          path: '/aesthetic-attars/combo'
        }
      ]
    },
    {
      id: 'fresheners',
      name: 'Air Fresheners',
      path: '/air-fresheners',
      hasDropdown: true,
      dropdownItems: [

        {
          name: 'Car Fresheners',
          path: '/air-fresheners/car'
        },
        {
          name: 'Room Fresheners',
          path: '/air-fresheners/room'
        }
      ]
    },
    {
      id: 'waxfume',
      name: 'Waxfume',
      path: '/waxfume',
      hasDropdown: false
    },
    {
      id: 'about',
      name: 'Our Story',
      path: '/about-us',
      hasDropdown: false
    },
    {
      id: 'contact',
      name: 'Contact Us',
      path: '/contact',
      hasDropdown: false
    }
  ];
  
  // Get all categories for search
  const searchCategories = [
    { name: 'Perfumes', id: 'perfumes' },
    { name: 'Attars', id: 'attars' },
    { name: 'Air Fresheners', id: 'fresheners' },
    { name: 'Waxfume', id: 'waxfume' }
  ];
  
  return (
    <>
      {/* Announcement Bar */}
      {componentSettings.announcement && (
        <div className="bg-black text-white text-center py-2 text-sm">
          Free shipping on orders above ₹500
        </div>
      )}
      
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 flex flex-col items-center">
          {/* Top Row: Search | Logo | Cart */}
          <div className="w-full flex items-center justify-between py-2 xs:py-4">
            {/* Search Bar (left) */}
            <div className="flex-1 flex justify-start">
              {componentSettings.search && (
                <button
                  onClick={toggleSearch}
                  className="text-gray-700 hover:text-black relative p-2 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
                  aria-label="Search"
                >
                  <FiSearch size={20} />
                </button>
              )}
            </div>
            {/* Logo (center) */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <Link href="/store-routes" className="flex gap-2 items-center">
                <img
                  src="/avito3-16.png"
                  alt="A V I T O   S C E N T S"
                  className="h-12 xs:h-16 sm:h-20 w-auto"
                />
              </Link>
            </div>
            {/* Cart (right) */}
            <div className="flex-1 flex justify-end items-center space-x-4">
              {componentSettings.miniCart && (
                <button
                  onClick={toggleMiniCart}
                  className="text-gray-700 hover:text-black relative p-2 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
                  aria-label="Cart"
                >
                  <FiShoppingBag size={20} />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-transform duration-300 animate-pulse">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              )}
              {/* Mobile menu options */}
              <div className="md:hidden relative">
                <button
                  onClick={toggleMobileOptions}
                  className="text-gray-700 hover:text-black p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
                  aria-label="Options"
                >
                  <FiMoreVertical size={24} />
                </button>
                
                {mobileOptionsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-50">
                    <div className="py-2">
                      <button
                        onClick={toggleMobileMenu}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black flex items-center"
                      >
                        {mobileMenuOpen ? <FiX className="mr-2" size={16} /> : <FiMenu className="mr-2" size={16} />}
                        {mobileMenuOpen ? 'Close Menu' : 'Menu'}
                      </button>
                      {navItems.track && (
                        <Link
                          href="/order-tracking"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                          onClick={() => setMobileOptionsOpen(false)}
                        >
                          Track Order
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Bar (below logo row) */}
          <nav className="hidden md:flex items-center space-x-6 justify-center w-full pb-2">
            {navigationItems.map((item) => 
              navItems[item.id] ? (
                <div 
                  key={item.id}
                  className="relative group"
                  ref={(el) => {
                    dropdownRefs.current[item.id] = el;
                  }}
                  onMouseEnter={() => item.hasDropdown && handleDropdownHover(item.id)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <div 
                    className={`flex items-center font-medium cursor-pointer relative 
                      ${pathname === item.path || pathname?.startsWith(item.path + '/') 
                        ? 'text-black' 
                        : 'text-gray-700 hover:text-black'}
                      ${pathname === item.path || pathname?.startsWith(item.path + '/') 
                        ? 'after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-black' 
                        : 'after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300 hover:after:w-full'
                      }`}
                    onClick={() => {
                      if (item.hasDropdown) {
                        toggleDropdown(item.id);
                        router.push(item.path);
                      } else {
                        router.push(item.path);
                      }
                    }}
                  >
                    {item.name}
                    {item.hasDropdown && <FiChevronDown className="ml-1 transition-transform duration-300 group-hover:rotate-180" size={16} />}
                  </div>
                  {item.hasDropdown && activeDropdown === item.id && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white shadow-lg rounded-md overflow-hidden z-20 transition-all duration-300 ease-in-out transform origin-top-left opacity-100 animate-[fadeIn_0.2s_ease-in-out]">
                      <div className="py-2 bg-white">
                        {item.dropdownItems?.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.path}
                            href={dropdownItem.path}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-all duration-200 hover:pl-6 border-l-0 hover:border-l-4 hover:border-black flex items-center"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <span className="w-2 h-2 rounded-full bg-black mr-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null
            )}
          </nav>
        </div>
        {/* Search Bar (expanded) */}
        {searchOpen && (
          <div className="border-t border-gray-200 py-4 px-4">
            <div className="container mx-auto">
              <form onSubmit={handleSearch}>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search for products..."
                      className="flex-1 border-gray-300 border rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-black"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button 
                      type="submit"
                      className="bg-black text-white py-2 px-6 rounded-r-md hover:bg-gray-800"
                    >
                      Search
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700">Search by category:</span>
                    {searchCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategorySearch(category.id)}
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full transition-colors"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </header>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 fixed inset-x-0 top-[60px] z-40 overflow-y-auto max-h-[calc(100vh-60px)]">
          <div className="container mx-auto px-4 py-4">
            {/* Back button */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <button
                onClick={toggleMobileMenu}
                className="flex items-center text-gray-700 hover:text-black"
              >
                <FiArrowLeft className="mr-2" size={20} />
                <span className="font-medium">Back</span>
              </button>
            </div>
            
            {/* Search in mobile menu */}
            {componentSettings.search && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <form onSubmit={handleSearch} className="flex">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="flex-1 border-gray-300 border rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="bg-black text-white py-2 px-4 rounded-r-md hover:bg-gray-800"
                  >
                    <FiSearch size={16} />
                  </button>
                </form>
              </div>
            )}
            
            <nav className="space-y-4">
              {navigationItems.map((item) => 
                navItems[item.id] ? (
                  <div key={item.id} className="border-b border-gray-100 pb-2">
                    {item.hasDropdown ? (
                      <>
                        <div className="flex items-center justify-between w-full py-2 font-medium text-gray-700 hover:text-black transition-colors">
                          <Link
                            href={item.path}
                            className="flex-grow"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <span>{item.name}</span>
                          </Link>
                          <button 
                            onClick={() => toggleDropdown(item.id)}
                            className="p-1 bg-gray-50 rounded-full"
                          >
                            <FiChevronDown className={`transition-transform duration-300 ${activeDropdown === item.id ? 'rotate-180' : ''}`} size={16} />
                          </button>
                        </div>
                        
                        {activeDropdown === item.id && (
                          <div className="pl-4 mt-2 space-y-2 border-l-2 border-gray-200 bg-white">
                            {item.dropdownItems?.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.path}
                                href={dropdownItem.path}
                                className="block py-2 text-gray-600 hover:text-black transition-colors hover:pl-2"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {dropdownItem.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.path}
                        className="block py-2 font-medium text-gray-700 hover:text-black transition-colors duration-200 hover:pl-2 border-l-0 hover:border-l-2 hover:border-black"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ) : null
              )}
              
              {/* Additional mobile menu items */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {navItems.about && (
                  <Link
                    href="/about-us"
                    className="block py-2 text-gray-700 hover:text-black transition-colors duration-200 hover:pl-2 border-l-0 hover:border-l-2 hover:border-black"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About Us
                  </Link>
                )}
                
                {/* {navItems.track && (
                  <Link
                    href="/track-order"
                    className="block py-2 text-gray-700 hover:text-black transition-colors duration-200 hover:pl-2 border-l-0 hover:border-l-2 hover:border-black"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Track Order
                  </Link>
                )} */}
              </div>
            </nav>
          </div>
        </div>
      )}
      
      {/* Mini Cart */}
      <MiniCartWithModal isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
    </>
  );
} 