'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiBox, FiShoppingBag, FiUsers, FiLogOut, FiSettings, FiMail, FiLayout, FiMenu, FiX, FiMessageSquare } from 'react-icons/fi';
import { useAdminAuth, adminLogout } from '@/app/lib/admin-auth';

interface AdminLayoutProps {
  children: ReactNode;
  activeRoute?: string;
}

// Add this debug function
function checkAdminAuthState() {
  console.log('Checking admin auth state...');
  
  // Check localStorage tokens
  const adminToken = localStorage.getItem('admin_token');
  const regularToken = localStorage.getItem('token');
  
  // Check cookies
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };
  
  const adminCookie = getCookie('admin_token');
  const regularCookie = getCookie('token');
  
  console.log({
    adminToken: adminToken ? 'Present' : 'Missing',
    regularToken: regularToken ? 'Present' : 'Missing',
    adminCookie: adminCookie ? 'Present' : 'Missing',
    regularCookie: regularCookie ? 'Present' : 'Missing'
  });
}

export default function AdminLayout({ children, activeRoute = '/admin/dashboard' }: AdminLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    checkAdminAuthState();
  }, []);
  
  const handleLogout = () => {
    adminLogout(router);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // useAdminAuth hook will automatically redirect if not authenticated
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-full flex items-center justify-center">
            <FiShoppingBag className="text-white" />
          </div>
          <h2 className="text-lg font-bold">Avito Admin</h2>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
      
      {/* Sidebar - Mobile (overlay) */}
      <div 
        className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      ></div>
      
      {/* Sidebar */}
      <div 
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 fixed md:sticky md:top-0 md:h-screen inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out
          flex flex-col overflow-hidden
        `}
      >
        <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-800">
          <div className="flex items-center space-x-2">

          <img src="/logoo1.png" alt="Logo" className="h-20 mx-auto" />
          </div>
        </div>
        
        <div className="md:hidden p-4 border-b">
          <h3 className="text-sm font-medium text-gray-500">Logged in as:</h3>
          <p className="font-medium">{user?.name || 'Admin'}</p>
          <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
        </div>
        
        <nav className="mt-6 flex-1 overflow-y-auto">
          <Link 
            href="/admin/dashboard" 
            className={`block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeRoute === '/admin/dashboard' ? 'bg-gray-100 text-gray-900 border-l-4 border-blue-600' : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex items-center">
              <FiBox className="mr-3" /> Dashboard
            </div>
          </Link>
          <Link 
            href="/admin/products" 
            className={`block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeRoute === '/admin/products' ? 'bg-gray-100 text-gray-900 border-l-4 border-blue-600' : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Products
            </div>
          </Link>
          <Link 
            href="/admin/orders" 
            className={`block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeRoute === '/admin/orders' ? 'bg-gray-100 text-gray-900 border-l-4 border-blue-600' : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Orders
            </div>
          </Link>
          <Link 
            href="/admin/users" 
            className={`block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeRoute === '/admin/users' ? 'bg-gray-100 text-gray-900 border-l-4 border-blue-600' : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex items-center">
              <FiUsers className="mr-3" /> Users
            </div>
          </Link>
          <Link 
            href="/admin/contacts" 
            className={`block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeRoute === '/admin/contacts' ? 'bg-gray-100 text-gray-900 border-l-4 border-blue-600' : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex items-center">
              <FiMail className="mr-3" /> Contacts
            </div>
          </Link>
          <Link 
            href="/admin/test-sms" 
            className={`block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeRoute === '/admin/test-sms' ? 'bg-gray-100 text-gray-900 border-l-4 border-blue-600' : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex items-center">
              <FiMessageSquare className="mr-3" /> Test SMS
            </div>
          </Link>
        </nav>
        
        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="w-full text-left py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 rounded-md"
          >
            <div className="flex items-center">
              <FiLogOut className="mr-3" /> Logout
            </div>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-x-hidden overflow-y-auto">
        {/* Header with user info */}
        <div className="hidden md:block mb-6">
          <h1 className="text-xl font-bold text-gray-900">Welcome, {user?.name || 'Admin'}</h1>
          <p className="text-gray-600 text-sm">Logged in as {user?.email || 'admin'}</p>
        </div>
        
        {/* Page content */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
} 