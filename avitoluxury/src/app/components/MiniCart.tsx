'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { useAuth } from './AuthProvider';

interface CartItem {
  id: string;
  _id?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const cartRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  // Handle click outside of cart panel to close it
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

  // Fetch cart items from API or localStorage
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        
        // For authenticated users, prioritize server cart
        if (isAuthenticated) {
          try {
            const response = await fetch('/api/cart', {
              credentials: 'include',
              headers: {
                'Cache-Control': 'no-cache'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.success && data.cart && Array.isArray(data.cart.items) && data.cart.items.length > 0) {
                setCartItems(data.cart.items);
                setSubtotal(data.cart.subtotal || 0);
                setLoading(false);
                return;
              }
            }
          } catch (serverError) {
            console.error('Error fetching server cart:', serverError);
          }
        }
        
        // For non-authenticated users or if server cart is empty/fails
        const savedCart = localStorage.getItem('cart') || '[]';
        let parsedCart = [];
        
        try {
          parsedCart = JSON.parse(savedCart);
          if (!Array.isArray(parsedCart)) {
            parsedCart = [];
          }
        } catch (parseError) {
          console.error('Error parsing cart data:', parseError);
          parsedCart = [];
        }
        
        setCartItems(parsedCart);
        
        // Calculate subtotal
        const total = parsedCart.reduce(
          (sum: number, item: CartItem) => sum + item.price * item.quantity,
          0
        );
        setSubtotal(total);
        
      } catch (error) {
        console.error('Error in fetchCart:', error);
        setCartItems([]);
        setSubtotal(0);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCart();
      
      // Listen for cart updates
      window.addEventListener('storage', fetchCart);
      window.addEventListener('cart-updated', fetchCart);
      
      return () => {
        window.removeEventListener('storage', fetchCart);
        window.removeEventListener('cart-updated', fetchCart);
      };
    }
  }, [isOpen, isAuthenticated]);

  // Handle quantity change
  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      if (isAuthenticated) {
        // Update cart in database for authenticated users
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({ productId: id, quantity: newQuantity }),
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            setCartItems(data.cart.items);
            setSubtotal(data.cart.subtotal);
            
            // Also update localStorage for UI consistency
            updateLocalStorage(id, newQuantity);
            return;
          }
        }
      }
      
      // For non-authenticated users or if server update failed
      updateLocalStorage(id, newQuantity);
      
    } catch (error) {
      console.error('Error updating cart:', error);
      updateLocalStorage(id, newQuantity);
    }
  };
  
  // Helper function to update localStorage cart
  const updateLocalStorage = (id: string, newQuantity: number) => {
    try {
      const savedCart = localStorage.getItem('cart') || '[]';
      let cart = JSON.parse(savedCart);
      
      if (!Array.isArray(cart)) {
        cart = [];
      }
      
      const updatedItems = cart.map((item: any) => 
        (item.id === id || item._id === id) ? { ...item, quantity: newQuantity } : item
      );
      
      // Update state
      setCartItems(updatedItems);
      
      // Recalculate subtotal
      const total = updatedItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(total);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      localStorage.setItem('cart_updated', Date.now().toString());
      
      // Trigger storage event for other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(updatedItems),
        storageArea: localStorage
      }));

      // Also dispatch a custom event for components that don't listen to storage
      window.dispatchEvent(new Event('cart-updated'));
      
      // Force refresh of component state
      const refreshItems = [...updatedItems];
      setCartItems(refreshItems);
    } catch (error) {
      console.error('Error updating localStorage cart:', error);
    }
  };

  // Handle removing an item
  const removeItem = async (id: string) => {
    try {
      if (isAuthenticated) {
        // Remove item from database cart for authenticated users
        const response = await fetch(`/api/cart?productId=${id}`, {
          method: 'DELETE',
          headers: {
            'Cache-Control': 'no-cache'
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            setCartItems(data.cart.items);
            setSubtotal(data.cart.subtotal);
            
            // Also update localStorage for UI consistency
            removeFromLocalStorage(id);
            return;
          }
        }
      }
      
      // For non-authenticated users or if server update failed
      removeFromLocalStorage(id);
      
    } catch (error) {
      console.error('Error removing item from cart:', error);
      removeFromLocalStorage(id);
    }
  };
  
  // Helper function to remove item from localStorage
  const removeFromLocalStorage = (id: string) => {
    try {
      const savedCart = localStorage.getItem('cart') || '[]';
      let cart = JSON.parse(savedCart);
      
      if (!Array.isArray(cart)) {
        cart = [];
      }
      
      // Filter out the item with matching id OR _id
      const updatedItems = cart.filter((item: any) => 
        !(item.id === id || item._id === id)
      );
      
      // Update state
      setCartItems(updatedItems);
      
      // Recalculate subtotal
      const total = updatedItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(total);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      localStorage.setItem('cart_updated', Date.now().toString());
      
      // Trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(updatedItems),
        storageArea: localStorage
      }));

      // Also dispatch a custom event for components that don't listen to storage
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error('Error removing item from localStorage cart:', error);
    }
  };

  // Apply discount code
  const applyDiscount = () => {
    // This would typically connect to an API to validate the code
    console.log('Applying discount code:', discountCode);
    // For now, just clear the input
    setDiscountCode('');
  };

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 w-full md:w-[450px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      ref={cartRef}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl font-bold">Shopping Cart</h2>
          <button onClick={onClose} className="p-2">
            <FiX size={24} />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-grow overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Link 
                href="/collection" 
                className="px-4 py-2 bg-black text-white hover:bg-gray-800"
                onClick={onClose}
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id || item._id} className="flex items-center border-b pb-4">
                  <div className="w-20 h-20 relative mr-4 border">
                    <Image 
                      src={item.image || "/images/placeholder-product.jpg"} 
                      alt={item.name}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        // @ts-ignore
                        e.target.src = "/images/placeholder-product.jpg";
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="flex items-center mt-2">
                      <button 
                        onClick={() => updateQuantity(item.id || item._id || '', item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border"
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus size={16} />
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        readOnly
                        className="w-10 text-center border-t border-b h-8"
                      />
                      <button 
                        onClick={() => updateQuantity(item.id || item._id || '', item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-500 hover:text-black mb-2"
                    >
                      Remove
                    </button>
                    <span className="font-medium">₹{item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with totals and checkout button */}
        <div className="p-4 border-t">
          {/* Discount code input */}
          <div className="flex mb-4">
            <input
              type="text"
              placeholder="Discount Code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="flex-grow border p-2"
            />
            <button 
              onClick={applyDiscount}
              className="bg-black text-white px-4 py-2 ml-2"
            >
              Apply
            </button>
          </div>
          
          {/* Subtotal */}
          <div className="flex justify-between mb-4">
            <span>Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          
          {/* Checkout button */}
          <Link
            href="/checkout"
            onClick={onClose}
            className="block w-full bg-black text-white text-center py-3 font-medium uppercase hover:bg-gray-900"
          >
            CHECKOUT
          </Link>
          
          <p className="text-center text-sm mt-4">Free Shipping on prepaid order</p>
        </div>
      </div>
    </div>
  );
} 