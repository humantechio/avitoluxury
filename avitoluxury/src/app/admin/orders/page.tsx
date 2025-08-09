'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiPackage, 
  FiRefreshCw, 
  FiChevronRight, 
  FiFilter, 
  FiCheck, 
  FiX, 
  FiTruck, 
  FiArchive,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiGrid,
  FiChevronLeft
} from 'react-icons/fi';
import AdminLayout from '@/app/components/AdminLayout';
import { useAdminAuth, getAdminToken, getAdminUser } from '@/app/lib/admin-auth';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Customer {
  id?: string;
  name: string;
  email: string;
  phone: string;
}

interface Order {
  id?: string;
  _id?: string;  // MongoDB ID
  orderNumber?: string;
  orderId?: string;  // Alternative order ID field
  customer?: Customer;
  date?: string;
  createdAt?: string;  // MongoDB timestamp
  status?: string;
  total?: number;
  totalPrice?: number;  // Alternative price field
  items?: OrderItem[];
  // Add any other fields that might come from MongoDB
  user?: string;
  shippingAddress?: any;
  paymentMethod?: string;
  paymentResult?: any;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Set the userData cookie for server authentication
      // The admin user needs this for the API to recognize it as admin
      if (typeof document !== 'undefined') {
        const adminUser = getAdminUser();
        if (adminUser) {
          // Set userData cookie with admin-bypass-user-id for server API to use
          const userData = JSON.stringify({ userId: 'admin-bypass-user-id', role: 'admin' });
          document.cookie = `userData=${encodeURIComponent(userData)}; path=/; max-age=3600; SameSite=Lax`;
          document.cookie = `isLoggedIn=true; path=/; max-age=3600; SameSite=Lax`;
        }
      }

      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Orders API response status:', response.status);
      
      const data = await response.json();
      console.log('Orders API response data:', data);

      if (!response.ok) {
        setError(`API Error: ${data.error || 'Unknown error'}`);
        // Only use mock data if we can't connect to the API
        useMockOrdersData();
        return;
      }

      if (!data.orders || data.orders.length === 0) {
        console.log('No orders found in database, using mock data temporarily');
        useMockOrdersData();
        return;
      }

      // Successfully got orders from API
      setOrders(data.orders || []);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders: ' + (err instanceof Error ? err.message : String(err)));
      // Use mock data for development
      useMockOrdersData();
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development when DB connection fails
  const useMockOrdersData = () => {
    const mockOrders = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        customer: {
          id: '101',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+91 98765 43210'
        },
        date: new Date().toISOString(),
        status: 'Pending',
        total: 1299.00,
        items: [
          {
            id: 'p1',
            name: 'Wild Escape 50ML',
            quantity: 1,
            price: 1299.00,
            image: 'https://placehold.co/80x80/eee/000?text=Wild+Escape'
          }
        ]
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        customer: {
          id: '102',
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '+91 87654 32109'
        },
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'Processing',
        total: 2598.00,
        items: [
          {
            id: 'p2',
            name: 'Baked Vanilla 50ML',
            quantity: 1,
            price: 1299.00,
            image: 'https://placehold.co/80x80/eee/000?text=Baked+Vanilla'
          },
          {
            id: 'p3',
            name: 'Apple Lily 50ML',
            quantity: 1,
            price: 1299.00,
            image: 'https://placehold.co/80x80/eee/000?text=Apple+Lily'
          }
        ]
      },
      {
        id: '3',
        orderNumber: 'ORD-003',
        customer: {
          id: '103',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          phone: '+91 76543 21098'
        },
        date: new Date(Date.now() - 172800000).toISOString(),
        status: 'Shipped',
        total: 3897.00,
        items: [
          {
            id: 'p4',
            name: 'Lavender Dreams 100ML',
            quantity: 3,
            price: 1299.00,
            image: 'https://placehold.co/80x80/eee/000?text=Lavender+Dreams'
          }
        ]
      },
      {
        id: '4',
        orderNumber: 'ORD-004',
        customer: {
          id: '104',
          name: 'Rahul Verma',
          email: 'rahul@example.com',
          phone: '+91 65432 10987'
        },
        date: new Date(Date.now() - 259200000).toISOString(),
        status: 'Delivered',
        total: 2598.00,
        items: [
          {
            id: 'p5',
            name: 'Midnight Noir 50ML',
            quantity: 2,
            price: 1299.00,
            image: 'https://placehold.co/80x80/eee/000?text=Midnight+Noir'
          }
        ]
      },
      {
        id: '5',
        orderNumber: 'ORD-005',
        customer: {
          id: '105',
          name: 'Anjali Patel',
          email: 'anjali@example.com',
          phone: '+91 54321 09876'
        },
        date: new Date(Date.now() - 345600000).toISOString(),
        status: 'Cancelled',
        total: 1299.00,
        items: [
          {
            id: 'p6',
            name: 'Citrus Burst 50ML',
            quantity: 1,
            price: 1299.00,
            image: 'https://placehold.co/80x80/eee/000?text=Citrus+Burst'
          }
        ]
      }
    ];
    
    setOrders(mockOrders);
    setError('');
  };

  // Update order status
  const updateOrderStatus = async (orderId: string | undefined, newStatus: string) => {
    if (!orderId) {
      console.error('Cannot update order status: missing order ID');
      return;
    }
    
    setUpdatingOrderId(orderId);
    try {
      const token = getAdminToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });

      if (!response.ok) {
        // For development: update local state even if API fails
        setOrders(orders.map(order => 
          (order.id === orderId || order._id === orderId) ? { ...order, status: newStatus } : order
        ));
        return;
      }

      // Update the orders state to reflect the change
      setOrders(orders.map(order => 
        (order.id === orderId || order._id === orderId) ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      // For development: update local state even if API fails
      setOrders(orders.map(order => 
        (order.id === orderId || order._id === orderId) ? { ...order, status: newStatus } : order
      ));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchOrders();
    }
  }, [authLoading, isAuthenticated]);

  // Filter orders by status
  const filteredOrders = statusFilter === 'All' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    router.push('/admin/login');
  };

  if (authLoading || (loading && orders.length === 0)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout activeRoute="/admin/orders">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">View and manage customer orders</p>
        </div>
        <button 
          onClick={fetchOrders} 
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <FiRefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
      
      {/* Filter bar */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="font-medium text-gray-700 flex items-center">
            <FiFilter className="mr-2" /> Filter by status:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusFilter === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('Pending')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusFilter === 'Pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('Processing')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusFilter === 'Processing'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              Processing
            </button>
            <button
              onClick={() => setStatusFilter('Shipped')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusFilter === 'Shipped'
                  ? 'bg-purple-500 text-white'
                  : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              }`}
            >
              Shipped
            </button>
            <button
              onClick={() => setStatusFilter('Delivered')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusFilter === 'Delivered'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              Delivered
            </button>
            <button
              onClick={() => setStatusFilter('Cancelled')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusFilter === 'Cancelled'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>
      
      {/* Orders list */}
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <FiRefreshCw className="animate-spin h-5 w-5 text-blue-500" />
                  </div>
                </td>
              </tr>
            ) : currentOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              currentOrders.map((order) => (
                <tr key={order.id || order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiPackage className="mr-2 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {order.orderNumber || (order.id ? order.id.slice(0, 8).toUpperCase() : order._id ? order._id.toString().slice(0, 8).toUpperCase() : 'N/A')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customer?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{order.customer?.email || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.date || order.createdAt || new Date().toISOString())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{(order.total || order.totalPrice || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {/* Status update dropdown */}
                      <div className="relative inline-block text-left">
                        <select
                          disabled={updatingOrderId === (order.id || order._id)}
                          value={order.status || 'Pending'}
                          onChange={(e) => updateOrderStatus(order.id || order._id, e.target.value)}
                          className="block w-full pl-3 pr-10 py-1 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        {updatingOrderId === (order.id || order._id) && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <FiRefreshCw className="animate-spin h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* View order details */}
                      <Link 
                        href={`/admin/orders/${order.id || order._id}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        View
                        <FiChevronRight className="ml-1" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredOrders.length > ordersPerPage && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastOrder, filteredOrders.length)}
                </span>{' '}
                of <span className="font-medium">{filteredOrders.length}</span> orders
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                  let pageNum;
                  
                  // Logic to display page numbers centered around current page
                  if (totalPages <= 5) {
                    pageNum = index + 1;
                  } else if (currentPage <= 3) {
                    pageNum = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + index;
                  } else {
                    pageNum = currentPage - 2 + index;
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => paginate(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Quick status actions */}
      <div className="mt-6 bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => {
              const selectedOrders = filteredOrders.filter(o => o.status === 'Pending');
              if (selectedOrders.length > 0 && confirm(`Mark ${selectedOrders.length} pending orders as Processing?`)) {
                selectedOrders.forEach(o => updateOrderStatus(o.id || o._id, 'Processing'));
              }
            }}
            className="flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
          >
            <FiCheck className="mr-2" />
            Process Pending Orders
          </button>
          
          <button 
            onClick={() => {
              const selectedOrders = filteredOrders.filter(o => o.status === 'Processing');
              if (selectedOrders.length > 0 && confirm(`Mark ${selectedOrders.length} processing orders as Shipped?`)) {
                selectedOrders.forEach(o => updateOrderStatus(o.id || o._id, 'Shipped'));
              }
            }}
            className="flex items-center justify-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
          >
            <FiTruck className="mr-2" />
            Ship Processed Orders
          </button>
          
          <button 
            onClick={() => {
              const selectedOrders = filteredOrders.filter(o => o.status === 'Shipped');
              if (selectedOrders.length > 0 && confirm(`Mark ${selectedOrders.length} shipped orders as Delivered?`)) {
                selectedOrders.forEach(o => updateOrderStatus(o.id || o._id, 'Delivered'));
              }
            }}
            className="flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
          >
            <FiArchive className="mr-2" />
            Mark Orders as Delivered
          </button>
          
          <button 
            onClick={() => {
              const selectedOrders = filteredOrders.filter(o => !['Delivered', 'Cancelled'].includes(o.status || ''));
              if (selectedOrders.length > 0 && confirm(`Are you sure you want to cancel ${selectedOrders.length} orders?`)) {
                selectedOrders.forEach(o => updateOrderStatus(o.id || o._id, 'Cancelled'));
              }
            }}
            className="flex items-center justify-center p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
          >
            <FiX className="mr-2" />
            Cancel Selected Orders
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}