'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiPackage, 
  FiUsers, 
  FiShoppingCart, 
  FiTag, 
  FiSettings,
  FiLogOut
} from 'react-icons/fi';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Products', href: '/dashboard/products', icon: FiPackage },
    { name: 'Users', href: '/dashboard/users', icon: FiUsers },
    { name: 'Orders', href: '/dashboard/orders', icon: FiShoppingCart },
    { name: 'Coupons', href: '/dashboard/coupons', icon: FiTag },
    { name: 'Settings', href: '/dashboard/settings', icon: FiSettings },
  ];
  
  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', { method: 'POST' });
      // Redirect to login page
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">A</span>
          </div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center space-x-2 px-4 py-3 rounded-lg text-red-300 hover:bg-red-900 hover:bg-opacity-30 hover:text-red-100 transition-colors"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
        <p className="mt-4 text-sm text-gray-400 text-center">© 2023 Ecommerce Admin</p>
      </div>
    </div>
  );
};

export default Sidebar; 