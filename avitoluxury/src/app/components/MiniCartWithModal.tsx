'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX, FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import OTPVerificationModal from './OTPVerificationModal';
import PhoneNumberModal from '../checkout/PhoneNumberModal';
import GuestCheckoutModal from './GuestCheckoutModal';

interface CartItem {
  _id: string;
  id?: string;  // Add optional id property to support both formats
  name: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  image: string;
}

interface MiniCartWithModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCartWithModal({ isOpen, onClose }: MiniCartWithModalProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showGuestCheckoutModal, setShowGuestCheckoutModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const cartRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Fetch cart items from localStorage
  useEffect(() => {
    const fetchCartItems = () => {
      if (isOpen) {
        try {
          setLoading(true);
          const storedCart = localStorage.getItem('cart');
          if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            setCartItems(parsedCart);
            
            // Calculate subtotal
            const total = parsedCart.reduce((sum: number, item: CartItem) => {
              const itemPrice = item.discountedPrice || item.price;
              return sum + (itemPrice * item.quantity);
            }, 0);
            
            setSubtotal(total);
          } else {
            setCartItems([]);
            setSubtotal(0);
          }
        } catch (error) {
          console.error('Error loading cart:', error);
          setCartItems([]);
          setSubtotal(0);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchCartItems();
    
    // Listen for cart updates
    window.addEventListener('storage', fetchCartItems);
    window.addEventListener('cart-updated', fetchCartItems);
    
    return () => {
      window.removeEventListener('storage', fetchCartItems);
      window.removeEventListener('cart-updated', fetchCartItems);
    };
  }, [isOpen]);
  
  // Handle clicks outside the cart
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      (item._id === itemId || item.id === itemId) ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    
    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Recalculate subtotal
    const newSubtotal = updatedCart.reduce((sum, item) => {
      const itemPrice = item.discountedPrice || item.price;
      return sum + (itemPrice * item.quantity);
    }, 0);
    
    setSubtotal(newSubtotal);
    
    // Dispatch storage event for other components to detect the change
    window.dispatchEvent(new Event('storage'));
    // Also dispatch a custom event for components that don't listen to storage
    window.dispatchEvent(new Event('cart-updated'));
    
    // Force refresh of component state
    const refreshItems = [...updatedCart];
    setCartItems(refreshItems);
  };
  
  const removeItem = (itemId: string) => {
    // Get the current cart from localStorage to ensure we're working with the latest data
    const storedCart = localStorage.getItem('cart');
    let currentCart: CartItem[] = [];
    
    try {
      if (storedCart) {
        currentCart = JSON.parse(storedCart);
      }
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
    }
    
    // Filter out the item with the specified ID
    const updatedCart = currentCart.filter((item: CartItem) => 
      // Check both _id and id properties to ensure compatibility
      !(item._id === itemId || item.id === itemId)
    );
    
    // Update state
    setCartItems(updatedCart);
    
    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Recalculate subtotal
    const newSubtotal = updatedCart.reduce((sum: number, item: CartItem) => {
      const itemPrice = item.discountedPrice || item.price;
      return sum + (itemPrice * item.quantity);
    }, 0);
    
    setSubtotal(newSubtotal);
    
    // Dispatch storage event for other components to detect the change
    window.dispatchEvent(new Event('storage'));
    // Also dispatch a custom event for components that don't listen to storage
    window.dispatchEvent(new Event('cart-updated'));
    
    // Force refresh of component state
    const refreshItems = [...updatedCart];
    setCartItems(refreshItems);
  };
  
  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone);
    setShowPhoneModal(false);
    setShowOtpModal(true);
    
    // Generate OTP
    fetch('/api/otp/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    })
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        console.error('Failed to generate OTP:', data.error);
      }
    })
    .catch(error => {
      console.error('Error generating OTP:', error);
    });
  };
  
  const handleOtpVerified = () => {
    setShowOtpModal(false);
    setShowGuestCheckoutModal(true);
  };
  
  const handleGuestCheckoutSubmit = (address: any) => {
    // Store guest info in localStorage
    localStorage.setItem('guest_checkout_info', JSON.stringify({
      ...address,
      phone: phoneNumber
    }));
    
    localStorage.setItem('guest_order_in_progress', 'true');
    
    // Redirect to checkout page
    router.push('/checkout');
  };
  
  const handleCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Redirect to checkout page
    router.push('/checkout');
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      ></div>
      
      <div
        ref={cartRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-medium flex items-center">
            <FiShoppingBag className="mr-2" />
            Your Cart
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FiShoppingBag size={64} className="text-gray-300 mb-4" />
              <p className="text-xl text-gray-500 mb-2">Your cart is empty</p>
              <p className="text-gray-400 mb-6">Add items to get started</p>
              <Link href="/collection" passHref>
                <span 
                  className="inline-block bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
                  onClick={onClose}
                >
                  Browse Products
                </span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id || item.id || ''} className="flex border-b pb-4">
                  <div className="w-20 h-20 relative flex-shrink-0">
                    <Image
                      src={item.image || '/placeholder-image.jpg'}
                      alt={item.name}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-lastica text-sm">{item.name}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item._id || item.id || '');
                        }}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Remove item"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const itemId = item._id || item.id || '';
                            updateQuantity(itemId, item.quantity - 1);
                          }}
                          className="px-2 py-1 text-gray-600 hover:text-black"
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const itemId = item._id || item.id || '';
                            updateQuantity(itemId, item.quantity + 1);
                          }}
                          className="px-2 py-1 text-gray-600 hover:text-black"
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                      
                      <div className="font-medium">
                        {item.discountedPrice ? (
                          <div>
                            <span className="text-gray-500 line-through mr-2">
                              ₹{item.price.toFixed(2)}
                            </span>
                            <span>₹{item.discountedPrice.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span>₹{item.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex justify-between mb-4">
              <span>Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              Shipping and taxes calculated at checkout
            </div>
            
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-3 px-4 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      {showPhoneModal && (
        <PhoneNumberModal
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          onSubmit={handlePhoneSubmit}
        />
      )}
      
      {showOtpModal && (
        <OTPVerificationModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          phone={phoneNumber}
          onVerified={handleOtpVerified}
        />
      )}
      
      {showGuestCheckoutModal && (
        <GuestCheckoutModal
          isOpen={showGuestCheckoutModal}
          onClose={() => setShowGuestCheckoutModal(false)}
          onSubmit={handleGuestCheckoutSubmit}
        />
      )}
    </>
  );
} 