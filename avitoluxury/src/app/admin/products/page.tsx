'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiBox, 
  FiShoppingBag, 
  FiUsers, 
  FiLogOut, 
  FiSettings, 
  FiChevronLeft, 
  FiChevronRight, 
  FiSearch, 
  FiFilter, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiGrid
} from 'react-icons/fi';
import AdminLayout from '@/app/components/AdminLayout';
import { useAdminAuth, getAdminToken } from '@/app/lib/admin-auth';
import Footer from '@/app/components/Footer';

// Define the Product type
interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  quantity: number;
  stock?: number;
  sold?: number;
  featured?: boolean;
  isNewProduct?: boolean;
  new_arrival?: boolean; // Map from isNewProduct
  best_seller?: boolean; // For backward compatibility
  mainImage?: string;
  images?: Array<{ url: string }> | string[];
  bulletPoints?: string[];
  createdAt: string;
}

export default function AdminProducts() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // The useAdminAuth hook handles authentication check and redirects
    if (!authLoading && isAuthenticated) {
      fetchProducts();
    }
  }, [authLoading, isAuthenticated]);
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Get admin token using the admin-auth utility
      const token = getAdminToken();
      if (!token) {
        console.error('No admin token available');
        setError('Authentication error. Please login again.');
        setLoading(false);
        return;
      }

      console.log('Fetching products with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('/api/products', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        throw new Error(`Failed to fetch products: ${errorText}`);
      }

      const data = await response.json();
      console.log('Products data received:', data ? 'Data exists' : 'No data', 
                 'Products count:', data.products ? data.products.length : 0);
      
      // Transform the data to match the expected format if needed
      const formattedProducts = (data.products || []).map((product: any) => ({
        ...product,
        new_arrival: product.isNewProduct, // Map MongoDB field to component expected field
        images: Array.isArray(product.images) ? 
          product.images.map((img: string) => ({ url: img })) : 
          [{ url: product.mainImage || 'https://placehold.co/80x80/eee/000?text=No+Image' }]
      }));
      
      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(formattedProducts.map((product: Product) => product.category))].filter(Boolean) as string[];
      setCategories(uniqueCategories);
      
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle search and filtering
  useEffect(() => {
    // Apply filters
    let result = [...products];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'inStock') {
        result = result.filter(product => (product.stock || product.quantity) > 0);
      } else if (statusFilter === 'outOfStock') {
        result = result.filter(product => (product.stock || product.quantity) <= 0);
      } else if (statusFilter === 'featured') {
        result = result.filter(product => product.featured);
      }
    }
    
    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, categoryFilter, statusFilter, products]);
  
  // Handle delete product
  const handleDeleteClick = (id: string) => {
    setDeleteProductId(id);
    setShowDeleteModal(true);
  };
  
  // Confirm delete product
  const confirmDelete = async () => {
    if (!deleteProductId) return;
    
    try {
      const token = getAdminToken();
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`/api/products/${deleteProductId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Remove product from state
        setProducts(prevProducts => prevProducts.filter(p => p._id !== deleteProductId));
        setFilteredProducts(prevFiltered => prevFiltered.filter(p => p._id !== deleteProductId));
        setShowDeleteModal(false);
      } else {
        setError('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
    }
  };
  
  // Pagination
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Product badge component
  const Badge = ({ featured, new_arrival, best_seller }: { featured?: boolean, new_arrival?: boolean, best_seller?: boolean }) => {
    if (featured) {
      return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Featured</span>;
    }
    if (new_arrival) {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">New</span>;
    }
    if (best_seller) {
      return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Best Seller</span>;
    }
    return null;
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
  
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Calculate current products to display based on pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  // Helper function to get image URL safely
  const getImageUrl = (product: Product): string => {
    if (!product.images || product.images.length === 0) {
      return product.mainImage || 'https://i.pinimg.com/564x/5f/74/9f/5f749f794a61f04c579e225e48e46b80.jpg';
    }
    
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') {
      return firstImage;
    } else if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
      return firstImage.url;
    }
    
    return product.mainImage || 'https://i.pinimg.com/564x/5f/74/9f/5f749f794a61f04c579e225e48e46b80.jpg';
  };
  
  return (
    <>
      <AdminLayout activeRoute="/admin/products">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          <div>
            <Link 
              href="/admin/products/add"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add New Product
            </Link>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="w-full sm:w-auto">
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="w-full sm:w-auto">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="inStock">In Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                  <option value="featured">Featured</option>
                </select>
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No products found. Try adjusting your filters or add new products.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inventory
                    </th>
                    <th scope="col" className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added On
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 object-cover rounded-md" 
                              src={getImageUrl(product)} 
                              alt={product.name} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 font-lastica">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-[150px] sm:max-w-xs">{product.description.substring(0, 50)}...</div>
                            <div className="sm:hidden text-xs text-gray-500 mt-1">{product.category || 'Uncategorized'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category || 'Uncategorized'}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                        <div className="md:hidden mt-1">
                          <Badge 
                            featured={product.featured} 
                            new_arrival={product.new_arrival} 
                            best_seller={product.best_seller} 
                          />
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <Badge 
                          featured={product.featured} 
                          new_arrival={product.new_arrival} 
                          best_seller={product.best_seller} 
                        />
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.quantity} in stock</div>
                        <div className="text-xs text-gray-500">{product.sold || 0} sold</div>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(product.createdAt)}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/product/${product._id}`}>
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <FiEye size={18} />
                            </button>
                          </Link>
                          <Link href={`/admin/products/edit/${product._id}`}>
                            <button className="text-blue-600 hover:text-blue-900">
                              <FiEdit size={18} />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDeleteClick(product._id)} 
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {filteredProducts.length > productsPerPage && (
            <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstProduct + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastProduct, filteredProducts.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredProducts.length}</span> products
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
                    
                    {/* Page Numbers - Only show on larger screens */}
                    <div className="hidden sm:flex">
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
                    </div>
                    
                    {/* Current page indicator for small screens */}
                    <div className="sm:hidden flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </div>
                    
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
        </div>
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <FiTrash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Product</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this product? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteProductId(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
      <Footer />
    </>
  );
}