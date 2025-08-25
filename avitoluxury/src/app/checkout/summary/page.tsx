'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiAlertCircle, FiCheck } from 'react-icons/fi';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  houseNo: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

interface CartItem {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  image: string;
}

export default function CheckoutSummaryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [alternatePhone, setAlternatePhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load form data from session storage and cart items from localStorage
  useEffect(() => {
    try {
      // Get form data from session storage
      const storedFormData = sessionStorage.getItem('checkout_form_data');
      if (!storedFormData) {
        // Redirect to checkout page if form data doesn't exist
        router.push('/checkout');
        return;
      }
      
      setFormData(JSON.parse(storedFormData));
      
      // Get cart items from localStorage
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
        
        // Calculate shipping cost (free for orders above ₹500)
        setShippingCost(total >= 500 ? 0 : 1);
      } else {
        // Redirect to cart page if cart is empty
        router.push('/cart');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      router.push('/checkout');
    }
  }, [router]);
  
  // Handle alternate phone number change
  const handleAlternatePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setAlternatePhone(value);
      setPhoneError('');
    }
  };
  
  // Handle payment
  const handlePayment = async () => {
    // Validate alternate phone if provided
    if (alternatePhone && !/^\d{10}$/.test(alternatePhone)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }
    
    if (!formData) {
      alert('Missing checkout information. Please try again.');
      router.push('/checkout');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create Razorpay order
      const orderResponse = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: {
            ...formData,
            alternatePhone: alternatePhone || undefined
          },
          cartItems,
          subtotal,
          shippingCost,
          totalAmount: subtotal + shippingCost
        }),
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }
      
      // Store order ID in session storage
      sessionStorage.setItem('checkout_order_id', orderData.orderId);
      
      // Redirect to payment page
      router.push('/checkout/payment');
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('An error occurred while processing your order. Please try again.');
      setIsLoading(false);
    }
  };
  
  // If form data is not loaded yet, show loading
  if (!formData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-medium mb-8">Order Summary</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Shipping Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{formData.fullName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{formData.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">+91 {formData.phone}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {formData.houseNo}, {formData.address}, {formData.landmark}, {formData.city}, {formData.state} - {formData.pincode}
                </p>
              </div>
            </div>
          </div>
          
          {/* Alternate Phone Number */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Alternate Phone Number (Optional)</h2>
            
            <div className="flex">
              <div className="flex items-center bg-gray-100 px-3 border border-r-0 border-gray-300 rounded-l-md">
                <span className="text-gray-500">+91</span>
              </div>
              <input
                type="text"
                value={alternatePhone}
                onChange={handleAlternatePhoneChange}
                placeholder="10-digit phone number"
                className={`flex-1 p-2 border rounded-r-md ${
                  phoneError ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={10}
              />
            </div>
            
            {phoneError && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {phoneError}
              </p>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              We'll use this number as an alternate contact for delivery
            </p>
          </div>
          
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Order Items</h2>
            
            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item._id} className="py-4 flex items-center">
                  <div className="h-16 w-16 relative flex-shrink-0">
                    <Image
                      src={item.image || '/perfume-placeholder.jpg'}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover rounded"
                    />
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <h3 className="font-lastica">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">
                      ₹{((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                    </p>
                    {item.discountedPrice && (
                      <p className="text-xs text-gray-500 line-through">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-medium mb-4">Payment Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'Free'}</span>
              </div>
              
              <div className="border-t pt-3 flex justify-between font-medium">
                <span>Total</span>
                <span>₹{(subtotal + shippingCost).toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className={`w-full py-3 rounded-md text-white font-medium ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
              }`}
            >
              {isLoading ? 'Processing...' : 'Pay Now'}
            </button>
            
            <div className="mt-4 text-xs text-gray-500 flex items-center justify-center">
              <FiCheck className="text-green-500 mr-1" />
              Secure payment via Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 