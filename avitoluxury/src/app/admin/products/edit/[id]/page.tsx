'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/app/components/AdminLayout';
import ProductForm from '@/app/components/ProductForm';
import { useAdminAuth } from '@/app/lib/admin-auth';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState<any>(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (productId && !authLoading && isAuthenticated) {
      fetchProductData();
    }
  }, [productId, authLoading, isAuthenticated]);
  
  const fetchProductData = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch product: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.product) {
        // Format the data to match our new schema
        const product = data.product;
        
        // Transform product data to match our form structure
        const transformedProduct = {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          sku: product.sku,
          quantity: product.quantity,
          brand: product.brand,
          
          // If product already has new fields, use them
          productType: product.productType || '',
          category: product.category || '',
          subCategories: product.subCategories || [],
          volume: product.volume || '',
          gender: product.gender || '', // Added gender field
          bulletPoints: product.bulletPoints || [''],
          
          // Marketing flags
          isBestSelling: product.isBestSelling || false,
          isNewArrival: product.isNewArrival || false,
          isBestBuy: product.isBestBuy || false,
          featured: product.featured || false,
          
          // Media
          media: [
            // Convert images to media format
            ...(product.images || []).map((url: string, index: number) => ({
              id: `image-${index}`,
              type: 'image' as const,
              url
            })),
            // Convert videos to media format if any
            ...(product.videos || []).map((url: string, index: number) => ({
              id: `video-${index}`,
              type: 'video' as const,
              url
            }))
          ]
        };
        
        setProductData(transformedProduct);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle successful product update
  const handleSuccess = () => {
    // Redirect to products list
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
            <p className="mt-2">Loading product data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-100 p-4 rounded-md text-red-700 mb-4">
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <button
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
        
        {productData && (
          <div className="bg-white rounded-lg shadow">
            <ProductForm 
              initialData={productData}
              isEditing={true}
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 