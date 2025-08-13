'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { FiSave, FiX, FiUpload, FiTrash } from 'react-icons/fi';

// Define the schema for product form validation
const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  slug: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  comparePrice: z.number().min(0, 'Compare price must be a positive number').optional(),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  quantity: z.number().min(0, 'Quantity must be a non-negative number'),
  brand: z.string().optional(),
  
  // New categorization fields
  productType: z.string().min(1, 'Product type is required'),
  category: z.string().min(1, 'Category is required'),
  subCategories: z.array(z.string()),
  volume: z.string().min(1, 'Volume is required'),
  gender: z.string().min(1, 'Gender is required'),
  bulletPoints: z.array(z.string().min(1, 'Bullet point cannot be empty')).optional(),
  
  // Marketing flags
  isBestSelling: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestBuy: z.boolean().default(false),
  featured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

// Media types
interface ProductMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  file?: File;
  preview?: string;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormValues & { media?: ProductMedia[] }>;
  isEditing?: boolean;
  onSuccess?: () => void;
}

// API endpoint for uploads
const API_UPLOAD_ENDPOINT = '/api/upload/cloudinary';

const ProductForm: React.FC<ProductFormProps> = ({ 
  initialData = {}, 
  isEditing = false,
  onSuccess
}) => {
  // Product type options
  const productTypes = [
    'Perfumes',
    'Aesthetic Attars',
    'Air Fresheners',
    'Waxfume (Solid)'
  ];

  // Dynamic categories based on product type
  const categoryOptions = {
    'Perfumes': ['Value for Money', 'Premium Perfumes', 'Luxury Perfumes', 'Combo Sets'],
    'Aesthetic Attars': ['Premium Attars', 'Luxury Attars', 'Combo Sets'],
    'Air Fresheners': ['Room Fresheners', 'Car Diffusers'],
    'Waxfume (Solid)': ['Tin Zar']
  };

  // Dynamic subcategories based on product type and category
  const subCategoryOptions = {
    'Perfumes': {
      'Value for Money': ['Peach', 'Sea Musk'],
      'Premium Perfumes': ['Founder', 'Nectar'],
      'Luxury Perfumes': ['Brise DavrilI'],
      'Combo Sets': [
        'Two 20 ml Set Combo Woman (Peach/Breeze)',
        'Four 20 ml Set Combo Unisex (Founder, Nectar, Sea Musk, Peach)',
        'Two 20 ml Combo Set MAN (Brise Davril, Nectar)',
        'Two 20 ml Combo Set COUPLE (Brise DavrilI, Peach)'
      ]
    },
    'Aesthetic Attars': {
      'Premium Attars': ['Rose', 'Amber', 'Sandalwood', 'Kewra', 'Green Khus', 'Coffee'],
      'Luxury Attars': ['Royal Blue', 'Blue Lomani', 'La Flora', 'Arabian OUD', 'Caramal'],
      'Combo Sets': [
        'Daily Officer Wear (Rose, Royal Blue, Arabian OUD)',
        'Party Wear (Musk Rose, Amber, La Flora)',
        'Gift Box (Rose, Caramal, Blue Lomani)'
      ]
    },
    'Air Fresheners': {
      'Room Fresheners': ['Lavender', 'Chandan', 'Gulab', 'Lemon', 'Musk', 'Vanila'],
      'Car Diffusers': ['Lavender', 'Chandan', 'Gulab', 'Lemon', 'Musk', 'Vanila']
    },
    'Waxfume (Solid)': {
      'Tin Zar': []
    }
  };

  // Dynamic volume options based on product type
  const volumeOptions = {
    'Perfumes': ['3ml', '6ml', '9ml', '10ml', '12ml', '15ml', '20ml', '30ml', '50ml', '100ml', '150ml', '200ml'],
    'Aesthetic Attars': ['3ml', '6ml', '9ml', '10ml', '12ml', '15ml', '20ml', '30ml', '50ml', '100ml', '150ml', '200ml'],
    'Air Fresheners': ['3ml', '6ml', '9ml', '10ml', '12ml', '15ml', '20ml', '30ml', '50ml', '100ml', '150ml', '200ml',],
    'Waxfume (Solid)': ['10gms', '25gms']
  };

  // Form state
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData.name || '',
      slug: initialData.slug || '',
      description: initialData.description || '',
      price: initialData.price || 0,
      comparePrice: initialData.comparePrice || 0,
      sku: initialData.sku || '',
      quantity: initialData.quantity || 0,
      brand: initialData.brand || 'A V I T O   S C E N T S',
      productType: initialData.productType || '',
      category: initialData.category || '',
      subCategories: initialData.subCategories || [],
      volume: initialData.volume || '',
      gender: initialData.gender || '',
      isBestSelling: initialData.isBestSelling || false,
      isNewArrival: initialData.isNewArrival || false,
      isBestBuy: initialData.isBestBuy || false,
      featured: initialData.featured || false,
      bulletPoints: initialData.bulletPoints || [''],
    }
  });
  
  // Watch for changes in productType and category to update dependent fields
  const selectedProductType = watch('productType');
  const selectedCategory = watch('category');

  // State for media handling
  const [media, setMedia] = useState<ProductMedia[]>(initialData.media || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Track whether this is the initial render
  const [isInitialized, setIsInitialized] = useState(false);
  
  // For editing mode, ensure category and volume options are available immediately
  useEffect(() => {
    if (isEditing && initialData.productType) {
      // No need to reset values here, just ensure they're enabled
    }
  }, [isEditing, initialData]);
  
  // Mark as initialized after the first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);
  
  // Reset dependent fields when product type changes, but only after initial render
  useEffect(() => {
    if (selectedProductType && isInitialized && !isEditing) {
      setValue('category', '');
      setValue('subCategories', []);
      setValue('volume', '');
    }
  }, [selectedProductType, setValue, isInitialized, isEditing]);
  
  // Reset subcategories when category changes, but only after initial render
  useEffect(() => {
    if (selectedCategory && isInitialized && !isEditing) {
      setValue('subCategories', []);
    }
  }, [selectedCategory, setValue, isInitialized, isEditing]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setLoading(true);
    setError('');
    setUploadStatus('Uploading images...');
    
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'product_images');
      
      const response = await fetch(API_UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Add the uploaded image to the media array
        const newMedia = {
          id: data.public_id,
          type: 'image' as const,
          url: data.url,
          preview: data.url
        };
        
        setMedia(prev => [...prev, newMedia]);
        setUploadStatus('Image uploaded successfully');
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setLoading(false);
      // Reset the file input
      e.target.value = '';
    }
  };
  
  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setLoading(true);
    setError('');
    setUploadStatus('Uploading video...');
    
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceType', 'video');
      formData.append('folder', 'product_videos');
      
      const response = await fetch(API_UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Add the uploaded video to the media array
        const newMedia = {
          id: data.public_id,
          type: 'video' as const,
          url: data.url,
          preview: data.url
        };
        
        setMedia(prev => [...prev, newMedia]);
        setUploadStatus('Video uploaded successfully');
      } else {
        throw new Error(data.error || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload video');
    } finally {
      setLoading(false);
      // Reset the file input
      e.target.value = '';
    }
  };
  
  // Handle media deletion
  const handleDeleteMedia = (idToDelete: string) => {
    setMedia(prev => prev.filter(item => item.id !== idToDelete));
  };

  // Add state and handlers for bulletPoints
  const [fields, setFields] = useState({ bulletPoints: initialData.bulletPoints || [''] });
  const handleBulletPointChange = (idx: number, value: string) => {
    const newPoints = [...fields.bulletPoints];
    newPoints[idx] = value;
    setFields({ ...fields, bulletPoints: newPoints });
    setValue('bulletPoints', newPoints);
  };
  const addBulletPoint = () => {
    setFields({ ...fields, bulletPoints: [...fields.bulletPoints, ''] });
  };
  const removeBulletPoint = (idx: number) => {
    const newPoints = fields.bulletPoints.filter((_, i) => i !== idx);
    setFields({ ...fields, bulletPoints: newPoints });
    setValue('bulletPoints', newPoints);
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    setError('');
    setUploadStatus('Saving product...');
    
    try {
      if (media.length === 0) {
        throw new Error('At least one image is required');
      }
      
      // Prepare product data for submission
      const productData = {
        ...data,
        bulletPoints: fields.bulletPoints.filter(point => point.trim() !== ''),
        mainImage: media.find(m => m.type === 'image')?.url || '',
        images: media.filter(m => m.type === 'image').map(m => m.url),
        videos: media.filter(m => m.type === 'video').map(m => m.url),
      };
      
      // Generate formData to send
      const formData = new FormData();
      formData.append('productInfo', JSON.stringify(productData));
      
      let response;
      
      if (isEditing && initialData._id) {
        response = await fetch(`/api/products/${initialData._id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        response = await fetch('/api/products', {
          method: 'POST',
          body: formData
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.success) {
        setUploadStatus('Product saved successfully!');
        if (onSuccess) onSuccess();
      } else {
        throw new Error(responseData.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving the product');
    } finally {
      setLoading(false);
    }
  };

  // Handle subcategory toggle
  const toggleSubCategory = (subCategory: string) => {
    const currentSubCategories = watch('subCategories');
    if (currentSubCategories.includes(subCategory)) {
      setValue('subCategories', currentSubCategories.filter(sc => sc !== subCategory));
    } else {
      setValue('subCategories', [...currentSubCategories, subCategory]);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {uploadStatus && (
        <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-md">
          {uploadStatus}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          {/* Product Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          {/* SKU */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU *
            </label>
            <input
              type="text"
              {...register('sku')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.sku && (
              <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
            )}
          </div>
          
          {/* Brand */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              {...register('brand')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          
          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="0.01"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compare Price
              </label>
              <input
                type="number"
                {...register('comparePrice', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          {/* Inventory */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Categorization</h2>
          
          {/* Product Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Type *
            </label>
            <select
              {...register('productType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Product Type</option>
              {productTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.productType && (
              <p className="mt-1 text-sm text-red-600">{errors.productType.message}</p>
            )}
          </div>
          
          {/* Category - Dynamic based on product type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={!selectedProductType && !isEditing}
            >
              <option value="">Select Category</option>
              {(selectedProductType || (isEditing && initialData.productType)) && 
                categoryOptions[(selectedProductType || initialData.productType) as keyof typeof categoryOptions]?.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              }
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
            {!selectedProductType && !isEditing && (
              <p className="mt-1 text-sm text-amber-600">Select a product type first</p>
            )}
          </div>
          
          {/* Sub-Categories - Multi-select based on category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub-Categories
            </label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
              {((selectedProductType && selectedCategory) || (isEditing && initialData.productType && initialData.category)) && 
                subCategoryOptions[(selectedProductType || initialData.productType) as keyof typeof subCategoryOptions]?.[
                  (selectedCategory || initialData.category) as keyof (typeof subCategoryOptions)[keyof typeof subCategoryOptions]
                ]?.map(subCat => (
                  <div key={subCat} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`subcat-${subCat}`}
                      checked={watch('subCategories')?.includes(subCat)}
                      onChange={() => toggleSubCategory(subCat)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor={`subcat-${subCat}`} className="ml-2 text-sm text-gray-700">
                      {subCat}
                    </label>
                  </div>
                ))}
              {((!selectedProductType && !isEditing) || (!selectedCategory && !isEditing)) && (
                <p className="text-sm text-gray-500">Select a product type and category first</p>
              )}
            </div>
          </div>
          
          {/* Volume - Dynamic based on product type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume *
            </label>
            <select
              {...register('volume')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={!selectedProductType && !isEditing}
            >
              <option value="">Select Volume</option>
              {(selectedProductType || (isEditing && initialData.productType)) && 
                volumeOptions[(selectedProductType || initialData.productType) as keyof typeof volumeOptions]?.map(vol => (
                  <option key={vol} value={vol}>{vol}</option>
                ))
              }
            </select>
            {errors.volume && (
              <p className="mt-1 text-sm text-red-600">{errors.volume.message}</p>
            )}
            {!selectedProductType && !isEditing && (
              <p className="mt-1 text-sm text-amber-600">Select a product type first</p>
            )}
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              {...register('gender')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unisex">Unisex</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">Marketing</h2>
          
          {/* Marketing Flags */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isBestSelling"
                {...register('isBestSelling')}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="isBestSelling" className="ml-2 text-sm text-gray-700">
                Best Selling
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isNewArrival"
                {...register('isNewArrival')}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="isNewArrival" className="ml-2 text-sm text-gray-700">
                New Arrival
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isBestBuy"
                {...register('isBestBuy')}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="isBestBuy" className="ml-2 text-sm text-gray-700">
                Best Buy
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                {...register('featured')}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                Featured
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bullet Points */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Bullet Points</h2>
        {fields.bulletPoints.map((point, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input
              type="text"
              value={point}
              onChange={e => handleBulletPointChange(idx, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <button type="button" onClick={() => removeBulletPoint(idx)} className="ml-2 text-red-600">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addBulletPoint} className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded">Add Bullet Point</button>
      </div>
      
      {/* Media Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Media</h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
          {media.map((item, index) => (
            <div key={item.id} className="relative">
              {item.type === 'image' ? (
                <img 
                  src={item.url} 
                  alt="Product" 
                  className="w-24 h-24 object-cover rounded-md border border-gray-300"
                />
              ) : (
                <video 
                  src={item.url}
                  className="w-24 h-24 object-cover rounded-md border border-gray-300"
                  controls
                />
              )}
              <button
                type="button"
                onClick={() => handleDeleteMedia(item.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={loading}
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50 cursor-pointer"
            >
              <FiUpload className="mr-2" /> Add Image
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Videos
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
              disabled={loading}
            />
            <label
              htmlFor="video-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50 cursor-pointer"
            >
              <FiUpload className="mr-2" /> Add Video
            </label>
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <FiSave className="mr-2" />
          {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm; 