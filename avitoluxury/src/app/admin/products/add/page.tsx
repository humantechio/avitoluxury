'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/AdminLayout';
import ProductForm from '@/app/components/ProductForm';
import { useAdminAuth } from '@/app/lib/admin-auth';

export default function AddProductPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // The useAdminAuth hook handles authentication check and redirects
    if (!authLoading && isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);
  
  // Handle successful product creation
  const handleSuccess = () => {
    // Redirect to products list after success
    router.push('/admin/products');
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <button
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <ProductForm onSuccess={handleSuccess} />
        </div>
      </div>
    </AdminLayout>
  );
} 