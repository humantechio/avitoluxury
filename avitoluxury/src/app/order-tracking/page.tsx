'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiLoader, FiAlertCircle, FiCheckCircle, FiPackage, FiTruck } from 'react-icons/fi';
import Image from 'next/image';
import Nav from '../components/Nav';

interface OrderDetails {
  trackingId: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  paymentMethod: string;
  totalPrice: number;
  shippingPrice: number;
  alternatePhone?: string;
}

export default function OrderTrackingPage() {
  const searchParams = useSearchParams();
  const trackingIdFromUrl = searchParams ? searchParams.get('tracking_id') || '' : '';
  
  const [trackingId, setTrackingId] = useState(trackingIdFromUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  
  // Fetch order details if tracking ID is in URL
  useEffect(() => {
    if (trackingIdFromUrl) {
      fetchOrderDetails(trackingIdFromUrl);
    }
  }, [trackingIdFromUrl]);
  
  // Handle tracking ID input change
  const handleTrackingIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackingId(e.target.value);
    setError(null);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }
    
    fetchOrderDetails(trackingId);
  };
  
  // Fetch order details from API
  const fetchOrderDetails = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/checkout/track-order?tracking_id=${id}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Order not found');
      }
      
      setOrderDetails(data.order);
      
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch order details');
      setOrderDetails(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <FiLoader className="text-blue-500" />;
      case 'Processing':
        return <FiPackage className="text-orange-500" />;
      case 'Shipped':
        return <FiTruck className="text-purple-500" />;
      case 'Delivered':
        return <FiCheckCircle className="text-green-500" />;
      case 'Cancelled':
        return <FiAlertCircle className="text-red-500" />;
      default:
        return <FiLoader className="text-gray-500" />;
    }
  };
  
  return (
    <>
      <Nav />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-8">Track Your Order</h1>
        
        {/* Tracking Form */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Tracking ID
              </label>
              <input
                type="text"
                id="trackingId"
                value={trackingId}
                onChange={handleTrackingIdChange}
                placeholder="e.g. ORD-123456"
                className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
              />
              {error && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {error}
                </p>
              )}
            </div>
            
            <div className="self-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full sm:w-auto h-10 px-6 rounded-md text-white font-medium ${
                  isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                }`}
              >
                {isLoading ? (
                  <FiLoader className="animate-spin mx-auto" />
                ) : (
                  <div className="flex items-center">
                    <FiSearch className="mr-2" />
                    Track
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Order Details */}
        {orderDetails && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 mb-6">
              <div className="mb-3 sm:mb-0">
                <h2 className="text-lg sm:text-xl font-medium">Order #{orderDetails.trackingId}</h2>
                <p className="text-gray-500">Placed on {formatDate(orderDetails.createdAt)}</p>
              </div>
              
              <div className="flex items-center">
                <span className="mr-2">Status:</span>
                <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                  {getStatusIcon(orderDetails.status)}
                  <span className="ml-2 font-medium">{orderDetails.status}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Shipping Information */}
              <div>
                <h3 className="text-lg font-medium mb-3">Shipping Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{orderDetails.shippingAddress.fullName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">
                      {orderDetails.shippingAddress.address}, {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} - {orderDetails.shippingAddress.postalCode}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">+91 {orderDetails.shippingAddress.phone}</p>
                  </div>
                  
                  {orderDetails.alternatePhone && (
                    <div>
                      <p className="text-sm text-gray-500">Alternate Phone</p>
                      <p className="font-medium">+91 {orderDetails.alternatePhone}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-medium mb-3">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{(orderDetails.totalPrice - orderDetails.shippingPrice).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{orderDetails.shippingPrice > 0 ? `₹${orderDetails.shippingPrice.toFixed(2)}` : 'Free'}</span>
                  </div>
                  
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>₹{orderDetails.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{orderDetails.paymentMethod}</p>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Order Items</h3>
              
              <div className="divide-y">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="py-4 flex items-center">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 relative flex-shrink-0">
                      <Image
                        src={item.image || '/perfume-placeholder.jpg'}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 48px, 64px"
                        className="object-cover rounded"
                      />
                    </div>
                    
                    <div className="ml-4 flex-grow">
                      <h4 className="font-medium text-sm sm:text-base">{item.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-sm sm:text-base">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 