'use client';

import { useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiPackage, FiSearch, FiTruck, FiCheck, FiLoader } from 'react-icons/fi';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface GuestOrder {
  _id: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: OrderItem[];
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  paymentMethod: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams?.get('id') || '';
  
  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<GuestOrder | null>(null);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!orderId && !phone) {
      setError('Please enter either an order ID or phone number');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Build the query string
      const queryParams = new URLSearchParams();
      if (orderId) queryParams.append('id', orderId);
      if (phone) queryParams.append('phone', phone);
      
      // Fetch order details
      const response = await fetch(`/api/guest-orders?${queryParams.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Order not found');
      }
      
      if (orderId) {
        // If searching by ID, we expect a single order
        setOrder(data.order);
      } else {
        // If searching by phone, we might get multiple orders
        // For simplicity, just show the most recent one
        const orders = data.orders || [];
        if (orders.length === 0) {
          throw new Error('No orders found for this phone number');
        }
        
        // Sort by date (newest first) and take the first one
        const sortedOrders = orders.sort((a: GuestOrder, b: GuestOrder) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setOrder(sortedOrders[0]);
      }
      
    } catch (error: any) {
      console.error('Error fetching order:', error);
      setError(error.message || 'Failed to load order details. Please try again later.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Automatically search if order ID is provided in URL
  useState(() => {
    if (initialOrderId) {
      handleSubmit(new Event('submit') as any);
    }
  });
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Track Your Order</h1>
          
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter your order ID"
                />
              </div>
              
              <div className="text-center text-gray-500 text-sm">OR</div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    // Only allow numbers and max 10 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(value);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter your 10-digit phone number"
                  maxLength={10}
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-400 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800'
                }`}
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <FiSearch className="mr-2" />
                    Track Order
                  </>
                )}
              </button>
            </div>
          </form>
          
          {order && (
            <div className="border-t border-gray-200 pt-8">
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">Order #{order._id.substring(order._id.length - 8)}</h2>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              {/* Order items */}
              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <h3 className="text-md font-medium mb-4">Order Items</h3>
                
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                        <Image
                          src={item.image || '/perfume-placeholder.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <h4 className="text-sm font-medium">{item.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Shipping status */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-4">Shipping Status</h3>
                
                <div className="relative">
                  <div className="absolute left-8 top-0 h-full w-1 bg-gray-200"></div>
                  
                  <div className="relative flex items-center mb-8">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center z-10">
                      <FiCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-md font-medium">Order Confirmed</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-center mb-8">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-full ${
                      order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered'
                        ? 'bg-green-100'
                        : 'bg-gray-200'
                    } flex items-center justify-center z-10`}>
                      {order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered' ? (
                        <FiCheck className="w-6 h-6 text-green-600" />
                      ) : (
                        <FiPackage className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className={`text-md font-medium ${
                        order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered'
                          ? ''
                          : 'text-gray-500'
                      }`}>Processing</h4>
                      <p className="text-xs text-gray-500">
                        {order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered'
                          ? 'Your order is being prepared'
                          : 'Waiting for processing'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-center">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-full ${
                      order.status === 'Shipped' || order.status === 'Delivered'
                        ? 'bg-green-100'
                        : 'bg-gray-200'
                    } flex items-center justify-center z-10`}>
                      {order.status === 'Shipped' || order.status === 'Delivered' ? (
                        <FiCheck className="w-6 h-6 text-green-600" />
                      ) : (
                        <FiTruck className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className={`text-md font-medium ${
                        order.status === 'Shipped' || order.status === 'Delivered'
                          ? ''
                          : 'text-gray-500'
                      }`}>Shipping</h4>
                      <p className="text-xs text-gray-500">
                        {order.status === 'Shipped'
                          ? 'Your order is on the way'
                          : order.status === 'Delivered'
                            ? 'Your order has been delivered'
                            : 'Waiting for shipment'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Shipping information */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-4">Shipping Information</h3>
                
                <div className="bg-gray-50 rounded-md p-4 text-sm">
                  <p className="font-medium">{order.customerInfo.name}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="mt-2">Phone: {order.customerInfo.phone}</p>
                </div>
              </div>
              
              {/* Order summary */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-4">Order Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{order.itemsPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{order.shippingPrice > 0 ? `₹${order.shippingPrice.toFixed(2)}` : 'Free'}</span>
                  </div>
                  
                  <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>₹{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/" className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 