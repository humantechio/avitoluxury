'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';
import Link from 'next/link';

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  trackingId?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=/store/orders');
      return;
    }
    
    // Fetch real orders from API
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/orders', { 
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        
        // Transform orders to match our interface
        const formattedOrders = data.orders.map((order: any) => ({
          id: order.id,
          date: order.date,
          status: order.status,
          total: order.total || 0,
          items: order.items?.length || 0,
          trackingId: order.trackingNumber
        }));
        
        setOrders(formattedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // If fetch fails, show empty orders
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, router, user]);
  
  // Format date to more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
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
        <h1 className="text-2xl md:text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600 mb-8">View and track your order history</p>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 className="font-medium">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">Placed on {formatDate(order.date)}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p><span className="text-gray-600">Items:</span> {order.items}</p>
                      <p><span className="text-gray-600">Total:</span> {formatPrice(order.total)}</p>
                    </div>
                    
                    <div className="space-y-2 md:space-y-0 md:space-x-3 flex flex-col md:flex-row">
                      <Link 
                        href={`/store/orders/${order.id}`} 
                        className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View Details
                      </Link>
                      
                      {order.trackingId && (
                        <Link
                          href={`/track-order?id=${order.trackingId}`}
                          className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
                        >
                          Track Order
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Link
              href="/collection"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 