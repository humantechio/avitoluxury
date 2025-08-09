'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiBox, FiShoppingBag, FiUsers, FiLogOut, FiSettings, FiRefreshCw, FiMail } from 'react-icons/fi';
import { useAdminAuth, adminLogout, getAdminToken } from '@/app/lib/admin-auth';

// Define types
interface RecentOrder {
  _id: string;
  orderNumber?: string;
  customer?: {
    name: string;
    email: string;
  };
  createdAt: string;
  status: string;
  total?: number;
  totalAmount?: number;
}

// Define the interface for dashboard data
interface DashboardData {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalContacts: number;
  pendingContacts: number;
  recentOrders: RecentOrder[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalContacts: 0,
    pendingContacts: 0,
    recentOrders: []
  });
  const [dataError, setDataError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch dashboard data on authentication success
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchDashboardData();
    }
  }, [authLoading, isAuthenticated]);
  
  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      // Fetch dashboard summary data
      const token = getAdminToken();
      
      if (!token) {
        console.error('No admin token available');
        setDataError('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setDashboardData(data);
      setDataError('');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDataError('Failed to load dashboard data. Please try again later.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    adminLogout(router);
  };
  
  const handleRefresh = () => {
    fetchDashboardData();
  };
  
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If not authenticated after loading completes, the useAdminAuth hook will redirect automatically
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-800">
          <img src="/logoo1.png" alt="Logo" className="h-20 mx-auto" />
        </div>
        <nav className="mt-6">
          <Link href="/admin/dashboard" className="block py-3 px-4 text-gray-900 font-medium bg-gray-100 hover:bg-gray-200 border-l-4 border-blue-600">
            <div className="flex items-center">
              <FiBox className="mr-3" /> Dashboard
            </div>
          </Link>
          <Link href="/admin/products" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Products
            </div>
          </Link>
          <Link href="/admin/orders" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Orders
            </div>
          </Link>
          <Link href="/admin/users" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiUsers className="mr-3" /> Users
            </div>
          </Link>
          <Link href="/admin/contacts" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiMail className="mr-3" /> Contacts
            </div>
          </Link>
          {/* <Link href="/admin/settings" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiSettings className="mr-3" /> Settings
            </div>
          </Link>
          <Link href="/admin/system" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiSettings className="mr-3" /> System
            </div>
          </Link> */}
          <button 
            onClick={handleLogout}
            className="w-full text-left py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900"
          >
            <div className="flex items-center">
              <FiLogOut className="mr-3" /> Logout
            </div>
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'Admin'}</h1>
            <p className="text-gray-600">Here's an overview of your store</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        
        {dataError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
            <p className="text-sm text-red-700">{dataError}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Orders Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <FiShoppingBag className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="ml-4 text-lg font-medium">Orders</h3>
            </div>
            <div className="flex justify-between">
              <span className="text-2xl font-bold">{dashboardData.totalOrders}</span>
              <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
          </div>
          
          {/* Users Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <FiUsers className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-4 text-lg font-medium">Users</h3>
            </div>
            <div className="flex justify-between">
              <span className="text-2xl font-bold">{dashboardData.totalUsers}</span>
              <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
          </div>
          
          {/* Products Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <FiBox className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="ml-4 text-lg font-medium">Products</h3>
            </div>
            <div className="flex justify-between">
              <span className="text-2xl font-bold">{dashboardData.totalProducts}</span>
              <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
          </div>
          
          {/* Contacts Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <FiMail className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="ml-4 text-lg font-medium">Contacts</h3>
            </div>
            <div className="flex justify-between">
              <span className="text-2xl font-bold">{dashboardData.totalContacts}</span>
              <Link href="/admin/contacts" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
            {dashboardData.pendingContacts > 0 && (
              <div className="mt-2">
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  {dashboardData.pendingContacts} pending
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Orders Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">View all orders</Link>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.orderNumber || order._id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{(order.total || order.totalAmount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 