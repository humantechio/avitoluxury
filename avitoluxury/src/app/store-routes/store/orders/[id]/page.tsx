'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../components/AuthProvider';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  items: OrderItem[];
  trackingId?: string;
  trackingUrl?: string;
  address: Address;
  paymentMethod: string;
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=/store/orders/' + params.id);
      return;
    }
    
    // Fetch order details (mock data for now)
    const fetchOrderDetails = () => {
      setIsLoading(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        const mockOrder: Order = {
          id: params.id,
          date: '2023-10-15T14:30:00Z',
          status: params.id === 'ORD-1001' ? 'Delivered' : 
                 params.id === 'ORD-1003' ? 'Shipped' : 'Processing',
          subtotal: 2999,
          shipping: 99,
          tax: 200,
          total: 3298,
          trackingId: params.id === 'ORD-1001' ? 'TRK7890123' : 
                     params.id === 'ORD-1003' ? 'TRK7891234' : undefined,
          trackingUrl: params.id === 'ORD-1001' || params.id === 'ORD-1003' ? 
                      'https://example.com/track' : undefined,
          items: [
            {
              id: 'PROD-001',
              name: 'Mystic Ocean Perfume',
              price: 1499,
              quantity: 1,
              image: 'https://placehold.co/300x400/272420/FFFFFF/png?text=Mystic+Ocean'
            },
            {
              id: 'PROD-002',
              name: 'Elegant Rose Perfume',
              price: 1500,
              quantity: 1,
              image: 'https://placehold.co/300x400/272420/FFFFFF/png?text=Elegant+Rose'
            }
          ],
          address: {
            name: 'John Doe',
            line1: '123 Main Street',
            line2: 'Apt 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            postal_code: '400001',
            country: 'India',
            phone: '+91 98765 43210'
          },
          paymentMethod: 'Credit Card (ending in 4567)'
        };
        
        setOrder(mockOrder);
        setIsLoading(false);
      }, 800);
    };
    
    fetchOrderDetails();
  }, [isAuthenticated, params.id, router]);
  
  // Format date to more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format price to currency
  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/store/orders" className="text-gray-600 hover:text-black mb-6 inline-flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Orders
        </Link>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : order ? (
          <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Order #{order.id}</h1>
                <p className="text-gray-600">Placed on {formatDate(order.date)}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'Delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'Shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium">Order Items</h2>
              </div>
              <div>
                {order.items.map((item) => (
                  <div key={item.id} className="px-6 py-4 flex flex-col md:flex-row border-b border-gray-200">
                    <div className="md:w-24 h-24 flex-shrink-0 overflow-hidden rounded-md mb-4 md:mb-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="md:ml-6 flex-grow">
                      <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <p className="text-base font-medium text-gray-900">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-gray-50">
                <dl className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(order.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt>Shipping</dt>
                    <dd>{formatPrice(order.shipping)}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt>Tax</dt>
                    <dd>{formatPrice(order.tax)}</dd>
                  </div>
                  <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200 mt-2">
                    <dt>Total</dt>
                    <dd>{formatPrice(order.total)}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Shipping Information */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-medium">Shipping Information</h2>
                </div>
                <div className="px-6 py-4">
                  <p className="font-medium">{order.address.name}</p>
                  <p>{order.address.line1}</p>
                  {order.address.line2 && <p>{order.address.line2}</p>}
                  <p>{`${order.address.city}, ${order.address.state} ${order.address.postal_code}`}</p>
                  <p>{order.address.country}</p>
                  <p className="mt-2">{order.address.phone}</p>
                </div>
              </div>
              
              {/* Payment & Tracking */}
              <div>
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-medium">Payment Method</h2>
                  </div>
                  <div className="px-6 py-4">
                    <p>{order.paymentMethod}</p>
                  </div>
                </div>
                
                {order.trackingId && (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h2 className="text-lg font-medium">Tracking Information</h2>
                    </div>
                    <div className="px-6 py-4">
                      <p><span className="text-gray-600">Tracking ID:</span> {order.trackingId}</p>
                      <div className="mt-4">
                        <Link
                          href={`/track-order?id=${order.trackingId}`}
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 w-full"
                        >
                          Track Package
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link
              href="/store/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
            >
              Return to Orders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 