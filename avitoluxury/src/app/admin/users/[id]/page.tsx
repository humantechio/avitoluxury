'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiLogOut,
  FiSettings,
  FiArrowLeft,
  FiSave,
  FiAlertTriangle
} from 'react-icons/fi';

// User type definition
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
  lastLogin: string | null;
  status: 'active' | 'inactive';
}

export default function EditUser() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in and has admin role
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
      
      setIsAdmin(true);
      fetchUser();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/admin/login');
    }
  }, [router, userId]);
  
  const fetchUser = async () => {
    setLoading(true);
    try {
      // Fetch user details from API
      const response = await fetch(`/api/users?id=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      const data = await response.json();
      
      if (!data.user) {
        throw new Error('User not found');
      }
      
      setUser(data.user);
      setFormData({
        name: data.user.name || '',
        email: data.user.email || '',
        role: data.user.role || 'user',
        phone: data.user.phone || '',
        status: data.user.status || 'active' as 'active' | 'inactive'
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Type assertion for status field to ensure it's correctly typed
    if (name === 'status') {
      setFormData({
        ...formData,
        [name]: value as 'active' | 'inactive'
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess(false);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }
      
      setSuccess(true);
      
      // Refresh user data with type safety
      if (user) {
        setUser({
          ...user,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          status: formData.status
        });
      }
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      
      // Scroll to top to show error message
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <FiAlertTriangle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-center mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The user you are looking for does not exist.'}</p>
          <div className="text-center">
            <Link 
              href="/admin/users" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FiArrowLeft className="mr-2" /> Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const isMainAdmin = user.email === 'admin@example.com';
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-800">
          <h2 className="text-xl font-bold text-white">A V I T O   S C E N T S Admin</h2>
        </div>
        <nav className="mt-6">
          <Link href="/admin/dashboard" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
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
          <Link href="/admin/users" className="block py-3 px-4 text-gray-900 font-medium bg-gray-100 hover:bg-gray-200 border-l-4 border-blue-600">
            <div className="flex items-center">
              <FiUsers className="mr-3" /> Users
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
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/admin/users" className="mr-4 text-blue-600 hover:text-blue-800">
                <FiArrowLeft size={20} />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            </div>
          </div>
        </div>
        
        {/* Success message */}
        {success && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
            <p>User updated successfully!</p>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full Name"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isMainAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="email@example.com"
                  required
                  disabled={isMainAdmin}
                />
                {isMainAdmin && (
                  <p className="mt-1 text-sm text-gray-500">The main admin email cannot be changed.</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Phone Number"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isMainAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={isMainAdmin}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {isMainAdmin && (
                  <p className="mt-1 text-sm text-gray-500">The main admin role cannot be changed.</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isMainAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={isMainAdmin}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {isMainAdmin && (
                  <p className="mt-1 text-sm text-gray-500">The main admin status cannot be changed.</p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-gray-600 text-sm">
                  <div>Created: {new Date(user.createdAt).toLocaleDateString()}</div>
                  <div>Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href="/admin/users"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                    disabled={saving}
                  >
                    <FiSave className="mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 