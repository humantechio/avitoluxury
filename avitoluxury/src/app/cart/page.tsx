'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingBag, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';

interface CartItem {
  _id: string;
  id?: string;
  name: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  image: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Load cart items from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        
        // Ensure each item has an _id property for React keys
        const normalizedCart = parsedCart.map((item: any) => ({
          ...item,
          _id: item._id || item.id // Use existing _id or fallback to id
        }));
        
        setCartItems(normalizedCart);
        
        // Calculate subtotal
        const total = normalizedCart.reduce((sum: number, item: CartItem) => {
          const itemPrice = item.discountedPrice || item.price;
          return sum + (itemPrice * item.quantity);
        }, 0);
        
        setSubtotal(total);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading cart:', error);
      setLoading(false);
    }
  }, []);
  
  // Update item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      (item._id === itemId || item.id === itemId) ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    
    // Update localStorage - ensure we're using the id property for localStorage
    const storageCart = updatedCart.map(item => ({
      id: item.id || item._id,
      name: item.name,
      price: item.price,
      discountedPrice: item.discountedPrice,
      image: item.image,
      quantity: item.quantity
    }));
    
    localStorage.setItem('cart', JSON.stringify(storageCart));
    
    // Recalculate subtotal
    const newSubtotal = updatedCart.reduce((sum, item) => {
      const itemPrice = item.discountedPrice || item.price;
      return sum + (itemPrice * item.quantity);
    }, 0);
    
    setSubtotal(newSubtotal);
  };
  
  // Remove item from cart
  const removeItem = (itemId: string) => {
    const updatedCart = cartItems.filter(item => 
      !(item._id === itemId || item.id === itemId)
    );
    setCartItems(updatedCart);
    
    // Update localStorage - ensure we're using the id property for localStorage
    const storageCart = updatedCart.map(item => ({
      id: item.id || item._id,
      name: item.name,
      price: item.price,
      discountedPrice: item.discountedPrice,
      image: item.image,
      quantity: item.quantity
    }));
    
    localStorage.setItem('cart', JSON.stringify(storageCart));
    
    // Recalculate subtotal
    const newSubtotal = updatedCart.reduce((sum, item) => {
      const itemPrice = item.discountedPrice || item.price;
      return sum + (itemPrice * item.quantity);
    }, 0);
    
    setSubtotal(newSubtotal);

    // Dispatch events to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cart',
      newValue: JSON.stringify(storageCart),
      storageArea: localStorage
    }));
    
    // Also dispatch a custom event for components that don't listen to storage
    window.dispatchEvent(new Event('cart-updated'));
  };
  
  // Proceed to checkout
  const handleCheckout = () => {
    router.push('/checkout');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium mb-8">Your Cart</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FiShoppingBag size={64} className="text-gray-300 mb-4" />
          <h2 className="text-xl text-gray-500 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add items to get started</p>
          <Link href="/collection">
            <span className="inline-block bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800">
              Browse Products
            </span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-4">Product</th>
                      <th className="text-center pb-4">Quantity</th>
                      <th className="text-right pb-4">Price</th>
                      <th className="text-right pb-4">Total</th>
                      <th className="text-right pb-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cartItems.map((item) => (
                      <tr key={item._id || item.id} className="py-4">
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-16 h-16 relative flex-shrink-0">
                              <Image
                                src={item.image || '/perfume-placeholder.jpg'}
                                alt={item.name}
                                fill
                                sizes="64px"
                                className="object-cover rounded"
                              />
                            </div>
                            <div className="ml-4">
                              <h3 className="font-medium">{item.name}</h3>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="p-1 text-gray-600 hover:text-black"
                              disabled={item.quantity <= 1}
                            >
                              <FiMinus size={16} />
                            </button>
                            <span className="mx-2 w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="p-1 text-gray-600 hover:text-black"
                            >
                              <FiPlus size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          {item.discountedPrice ? (
                            <div>
                              <span className="text-gray-500 line-through text-sm">
                                ₹{item.price.toFixed(2)}
                              </span>
                              <div>₹{item.discountedPrice.toFixed(2)}</div>
                            </div>
                          ) : (
                            <div>₹{item.price.toFixed(2)}</div>
                          )}
                        </td>
                        <td className="py-4 text-right font-medium">
                          ₹{((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => removeItem(item._id)}
                            className="text-gray-400 hover:text-red-500"
                            aria-label="Remove item"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{subtotal >= 500 ? 'Free' : '₹70.00'}</span>
                </div>
                
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">₹{(subtotal + (subtotal >= 500 ? 0 : 70)).toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-4 text-center">
                <Link href="/collection" className="text-gray-600 hover:text-black">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 