'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiMinus, FiArrowLeft } from 'react-icons/fi';
import Image from 'next/image';
import AddToCartButton from '@/app/components/AddToCartButton';
import MiniCartWithModal from '@/app/components/MiniCartWithModal';
import { useAuth } from '@/app/components/AuthProvider';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  brand: string;
  mainImage: string;
  images: string[];
  quantity: number;
  gender: string;
  volume: string;
  productType: string;
  subCategories: string[];
  attributes?: Record<string, string>;
  bulletPoints?: string[];
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        
        // Fetch the product from the API
        const response = await fetch(`/api/products/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        
        if (data.success && data.product) {
          console.log("Product fetched successfully:", data.product._id, "Product Type:", data.product.productType);
          setProduct(data.product);
          // Fetch related products after getting the product
          fetchRelatedProducts(data.product.productType);
        } else {
          throw new Error('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
  }, [params.id]);

  // Fetch related products
  const fetchRelatedProducts = async (productType: string) => {
    try {
      console.log("Fetching related products for product type:", productType);
      const response = await fetch(`/api/products?productType=${productType}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch related products');
      }
      
      const data = await response.json();
      
      if (data.success && data.products) {
        console.log("Related products API response:", data.products.length, "products found");
        // Filter out the current product and limit to 8 products
        const filtered = data.products
          .filter((p: any) => p._id !== params.id)
          .slice(0, 8);
        
        console.log("Filtered related products:", filtered.length, "products after filtering");
        setRelatedProducts(filtered);
        
        // If no related products found by productType, try to fetch by category
        if (filtered.length === 0 && product) {
          fetchRelatedProductsByCategory(product.category);
        }
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
      // If error occurs, try to fetch by category as fallback
      if (product) {
        fetchRelatedProductsByCategory(product.category);
      }
    }
  };

  // Fallback: Fetch related products by category
  const fetchRelatedProductsByCategory = async (category: string) => {
    try {
      console.log("Fallback: Fetching related products by category:", category);
      const response = await fetch(`/api/products?category=${category}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch related products by category');
      }
      
      const data = await response.json();
      
      if (data.success && data.products) {
        console.log("Category related products API response:", data.products.length, "products found");
        // Filter out the current product and limit to 8 products
        const filtered = data.products
          .filter((p: any) => p._id !== params.id)
          .slice(0, 8);
        
        console.log("Filtered category related products:", filtered.length, "products after filtering");
        setRelatedProducts(filtered);
        
        // If still no products, fetch random products as a last resort
        if (filtered.length === 0) {
          fetchRandomProducts();
        }
      }
    } catch (error) {
      console.error('Error fetching related products by category:', error);
      // Last resort: fetch random products
      fetchRandomProducts();
    }
  };

  // Last resort: Fetch random products
  const fetchRandomProducts = async () => {
    try {
      console.log("Last resort: Fetching random products");
      const response = await fetch('/api/products?limit=8');
      
      if (!response.ok) {
        throw new Error('Failed to fetch random products');
      }
      
      const data = await response.json();
      
      if (data.success && data.products) {
        console.log("Random products API response:", data.products.length, "products found");
        // Filter out the current product and limit to 8 products
        const filtered = data.products
          .filter((p: any) => p._id !== params.id)
          .slice(0, 8);
        
        console.log("Filtered random products:", filtered.length, "products after filtering");
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error('Error fetching random products:', error);
    }
  };

  // Update zoom image URL when selected image changes
  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setZoomImageUrl(product.images[selectedImage]);
    } else if (product && product.mainImage) {
      setZoomImageUrl(product.mainImage);
    }
  }, [product, selectedImage]);

  const handleBuyNow = () => {
    if (!product) return;
    
    // Add to cart first
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      discountedPrice: product.comparePrice && product.comparePrice > product.price ? product.price : undefined,
      quantity: quantity,
      image: product.mainImage || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'),
    };
    
    // Get existing cart or create new one
    let cart = [];
    try {
      const existingCart = localStorage.getItem('cart');
      if (existingCart) {
        cart = JSON.parse(existingCart);
      }
    } catch (err) {
      console.error('Error reading cart from localStorage:', err);
    }
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex((item: any) => item._id === product._id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if already in cart
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.push(cartItem);
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Dispatch storage event for other components to detect the change
    window.dispatchEvent(new Event('storage'));
    
    // Navigate to checkout
    router.push('/checkout');
  };
  
  const updateQuantity = (value: number) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 10)) {
      setQuantity(newQuantity);
    }
  };
  
  const showMiniCart = () => {
    setMiniCartOpen(true);
  };
  
  const getDiscountPercentage = () => {
    if (!product || !product.comparePrice || product.comparePrice <= product.price) return 0;
    
    const discount = ((product.comparePrice - product.price) / product.comparePrice) * 100;
    return Math.round(discount);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };
  
  const handleMouseEnter = () => {
    setIsZoomed(true);
  };
  
  const handleMouseLeave = () => {
    setIsZoomed(false);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-medium text-red-600 mb-4">Error</h2>
        <p className="text-gray-700">{error || 'Product not found'}</p>
        <button 
          onClick={() => router.push('/collection')}
          className="mt-6 px-6 py-2 bg-black text-white hover:bg-gray-800"
        >
          Browse Products
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      {/* Add MiniCartWithModal component */}
      <MiniCartWithModal isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
      
      {/* Back button */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-600 hover:text-black"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div 
            ref={imageContainerRef}
            className="aspect-square bg-gray-50 relative overflow-hidden border cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative' }}
          >
            {/* Regular image */}
            <Image 
              src={product.images && product.images.length > 0 
                ? product.images[selectedImage] 
                : product.mainImage || '/images/placeholder-product.jpg'
              }
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'contain' }}
              priority
            />
            
            {/* Zoom overlay */}
            {isZoomed && zoomImageUrl && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${zoomImageUrl})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '200%',
                  backgroundOrigin: 'content-box',
                  zIndex: 10
                }}
              />
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-auto">
              {product.images.map((image, index) => (
                <button 
                  key={index} 
                  className={`w-20 h-20 border-2 ${selectedImage === index ? 'border-black' : 'border-transparent'}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <div className="relative w-full h-full">
                    <Image 
                      src={image} 
                      alt={`${product.name} view ${index + 1}`} 
                      fill
                      sizes="80px"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          {/* Product Title and Brand */}
          <div>
            <h1 className="text-3xl font-medium text-black font-lastica">{product.name}</h1>
            <div className="text-sm text-gray-500 mt-1">
              {product.brand || 'A V I T O   S C E N T S'} | {product.volume || '50ml'} | {product.gender || 'Unisex'}
            </div>
          </div>
          
          {/* Price */}
          <div className="flex items-center flex-wrap">
            {product.comparePrice ? (
              <>
                <span className="text-2xl font-medium text-black mr-3">₹{product.price.toFixed(2)}</span>
                <span className="text-sm text-gray-500 line-through mr-3">MRP ₹{product.comparePrice.toFixed(2)}</span>
                {getDiscountPercentage() > 0 && <span className="text-sm text-green-700">({getDiscountPercentage()}% OFF)</span>}
              </>
            ) : (
              <span className="text-2xl font-medium text-black">₹{product.price.toFixed(2)}</span>
            )}
          </div>
          
          {/* Stock status */}
          <div>
            {product.quantity > 0 ? (
              <span className="text-sm font-medium text-green-700">In Stock</span>
            ) : (
              <span className="text-sm font-medium text-red-600">Out of Stock</span>
            )}
          </div>
          
          {/* Quantity selector */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex border border-gray-300">
              <button 
                onClick={() => updateQuantity(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center border-r border-gray-300"
              >
                <FiMinus size={16} />
              </button>
              <span className="w-12 h-10 flex items-center justify-center">
                {quantity}
              </span>
              <button 
                onClick={() => updateQuantity(1)}
                disabled={quantity >= (product.quantity || 10)}
                className="w-10 h-10 flex items-center justify-center border-l border-gray-300"
              >
                <FiPlus size={16} />
              </button>
            </div>
            {/* Volume next to quantity */}
            <span className="ml-4 flex items-center text-sm text-gray-700">
              <span className="mx-2 h-5 border-l border-gray-300" />
              <span>Volume: <span className="font-medium">{product.volume || '50ml'}</span></span>
            </span>
          </div>
          
          {/* Add to cart and Buy now buttons */}
          <div className="flex space-x-4 mb-6">
            <AddToCartButton
              productId={product._id}
              productName={product.name}
              productPrice={product.price}
              productImage={product.mainImage || (product.images && product.images.length > 0 ? product.images[0] : '')}
              className="flex-1 px-4 py-3 bg-black text-white hover:bg-gray-800 flex items-center justify-center"
            />
            
            <button 
              onClick={handleBuyNow}
              disabled={product.quantity <= 0}
              className="flex-1 px-4 py-3 border border-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>
          
          {/* Description */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Description</h3>
            <p className="text-gray-700 ">{product.description}</p>
          </div>
          
          {/* Bullet Points */}
          {product.bulletPoints && product.bulletPoints.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium mb-4">Key Features</h3>
              <ul className="list-disc pl-5 space-y-2">
                {product.bulletPoints.map((point, index) => (
                  <li key={index} className="text-gray-700">{point}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Product Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Product Details</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Category</td>
                  <td className="py-2">{product.category}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Brand</td>
                  <td className="py-2">{product.brand || 'A V I T O   S C E N T S'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Volume</td>
                  <td className="py-2">{product.volume || '50ml'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">
                    {product.productType === 'Air Fresheners' ? 'Use For' : 'Gender'}
                  </td>
                  <td className="py-2">
                    {product.productType === 'Air Fresheners' 
                      ? (product.category || product.gender || 'Unisex') 
                      : (product.gender || 'Unisex')
                    }
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Product Type</td>
                  <td className="py-2">{product.productType}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pb-12 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-medium text-center mb-8">Related Products</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct._id} className="group relative">
                <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75">
                  <Link href={`/product/${relatedProduct._id}`}>
                    <Image
                      src={relatedProduct.mainImage || (relatedProduct.images && relatedProduct.images.length > 0 ? relatedProduct.images[0] : '/images/placeholder-product.jpg')}
                      alt={relatedProduct.name}
                      width={300}
                      height={300}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <Link href={`/product/${relatedProduct._id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {relatedProduct.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{relatedProduct.brand || 'A V I T O   S C E N T S'}</p>
                  </div>
                  <div>
                    {relatedProduct.comparePrice && relatedProduct.comparePrice > relatedProduct.price ? (
                      <div>
                        <p className="text-sm font-medium text-gray-900">₹{relatedProduct.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500 line-through">₹{relatedProduct.comparePrice.toFixed(2)}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">₹{relatedProduct.price.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}