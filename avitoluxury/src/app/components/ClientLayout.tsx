'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const pathname = usePathname();
  
  // Only show on home page
  const isHomePage = pathname === '/store-routes/store';
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Listen for mini cart open/close events
  useEffect(() => {
    const checkMiniCart = () => {
      // Check for mini cart element visibility
      const miniCartElement = document.querySelector('[data-mini-cart="true"]');
      setMiniCartOpen(!!miniCartElement && window.getComputedStyle(miniCartElement).display !== 'none');
    };
    
    // Initial check
    checkMiniCart();
    
    // Set up mutation observer to detect mini cart changes
    const observer = new MutationObserver(checkMiniCart);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Show the button after scrolling down
  useEffect(() => {
    // Check if tooltip was closed
    const tooltipClosed = localStorage.getItem('whatsapp_tooltip_closed');
    
    const handleScroll = () => {
      if (window.scrollY > 300 && isHomePage && !miniCartOpen && !tooltipClosed) {
        setShowWhatsApp(true);
      } else {
        setShowWhatsApp(false);
        setShowTooltip(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage, miniCartOpen]);
  
  // Auto-hide tooltip after some time
  useEffect(() => {
    let tooltipTimer: NodeJS.Timeout;
    if (showWhatsApp && !showTooltip) {
      tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
      }, 2000);
      
      // Auto hide after 8 seconds
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 10000);
      
      return () => {
        clearTimeout(tooltipTimer);
        clearTimeout(hideTimer);
      };
    }
    return () => {};
  }, [showWhatsApp, showTooltip]);
  
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/919928200900', '_blank');
  };
  
  const closeTooltip = () => {
    setShowTooltip(false);
    // Store in localStorage that tooltip was closed (persists until page refresh)
    localStorage.setItem('whatsapp_tooltip_closed', 'true');
  };
  
  return (
    <>
      {children}
      
      {/* WhatsApp Button - Only show on home page and when mini cart is closed */}
      {showWhatsApp && isHomePage && !miniCartOpen && (
        <div className={`fixed ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-50`}>
          {showTooltip && (
            <div className={`absolute bottom-16 ${isMobile ? 'right-0 w-56' : 'right-0 w-64'} bg-white rounded-lg shadow-lg p-3 mb-2 animate-fade-in`}>
              <button 
                onClick={closeTooltip}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                aria-label="Close tooltip"
              >
                <IoClose size={16} />
              </button>
              <p className="text-sm font-medium">Need help with your order?</p>
              <p className="text-xs text-gray-600 mt-1">Chat with us on WhatsApp for quick assistance!</p>
            </div>
          )}
          
          <button
            onClick={handleWhatsAppClick}
            className={`bg-green-500 hover:bg-green-600 text-white ${isMobile ? 'p-2.5' : 'p-3'} rounded-full shadow-lg transition-all duration-300 hover:scale-110`}
            aria-label="Contact via WhatsApp"
          >
            <FaWhatsapp size={isMobile ? 24 : 28} />
          </button>
        </div>
      )}
    </>
  );
} 