'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiShoppingBag, FiArrowLeft, FiVideo, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';
import { useAuth } from '@/app/components/AuthProvider';
import AddToCartButton from '@/app/components/AddToCartButton';
// Removed AddToWishlistButton import
import { UserActivityTracker } from '@/app/services/UserActivityTracker';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  category: string;
  brand: string;
  images: { url: string }[];
  videos: { url: string }[];
  stock: number;
  fragrance_notes?: {
    top: string[];
    middle: string[];
    base: string[];
  };
  concentration?: string;
  size?: number;
  gender?: string;
  productType?: string;
  volumeRaw?: string; // Added for unit determination
  bulletPoints?: string[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user } = useAuth();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  // Check user login status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);
  
  // Track product view
  useEffect(() => {
    if (product && !loading) {
      UserActivityTracker.trackProductView(
        product._id,
        window.location.pathname,
        user?.userId
      );
    }
  }, [product, loading, user]);
  
  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        
        // Fetch the product from the API
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error (${response.status}): ${errorText}`);
          throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.product) {
          
          
          // Get attributes safely with fallback to empty object
          const attributes = data.product.attributes || {};
          
          // Transform API data to match our component's format
          const productData = {
            _id: data.product._id,
            name: data.product.name,
            description: data.product.description || "No description available",
            price: data.product.price,
            discountedPrice: data.product.comparePrice || 0,
            category: data.product.category || "Perfume",
            brand: data.product.brand || 'A V I T O   S C E N T S',
            images: data.product.images ? 
              data.product.images.map((img: string) => ({ url: img })) : 
              [{ url: data.product.mainImage || 'https://placehold.co/600x800/222/fff?text=Product' }],
            videos: data.product.videos ? 
              data.product.videos.map((vid: string) => ({ url: vid })) : 
              [],
            stock: data.product.quantity || 0,
            bulletPoints: data.product.bulletPoints || [],
            fragrance_notes: {
              top: [data.product.gender || 'Unisex'],
              middle: [data.product.volume || '50ml'],
              base: data.product.subCategories && data.product.subCategories.length > 0 ? 
                data.product.subCategories : ['Scent']
            },
            concentration: data.product.productType || 'Eau de Parfum',
            size: parseInt(data.product.volume?.replace(/[^0-9]/g, '') || '50'),
            gender: data.product.gender || 'Unisex',
            productType: data.product.productType || 'Eau de Parfum',
            volumeRaw: data.product.volume // Store original volume for unit determination
          };
          
          setProduct(productData);
          
          // Fetch related products of the same productType
          fetchRelatedProducts(data.product.productType);
        } else {
          console.error('Product data invalid:', data);
          throw new Error('Product not found or data invalid');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product details');
        
        // Fallback to mock data if needed
        setProduct({
          _id: id as string,
          name: 'Wild Escape Perfume',
          description: 'A captivating blend that transports you to a lush forest after rainfall.',
          price: 1499,
          discountedPrice: 1299,
          category: 'Woody',
          brand: 'A V I T O   S C E N T S',
          stock: 10,
          images: [
            { url: 'https://placehold.co/600x800/222/fff?text=Wild+Escape' },
            { url: 'https://placehold.co/600x800/333/fff?text=Product+Side' },
            { url: 'https://placehold.co/600x800/444/fff?text=Product+Back' },
          ],
          videos: [],
          bulletPoints: [
            'Long-lasting fragrance with 8-10 hours of wear',
            'Made with premium natural ingredients',
            'Suitable for all occasions'
          ],
          fragrance_notes: {
            top: ['Bergamot', 'Lemon', 'Green Apple'],
            middle: ['Pine', 'Cedar', 'Lavender'],
            base: ['Sandalwood', 'Musk', 'Amber']
          },
          concentration: 'Eau de Parfum',
          size: 50,
          gender: 'Unisex',
          productType: 'Eau de Parfum',
          volumeRaw: '50ml' // Mock data for unit
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchProduct();
    }
  }, [id]);
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    // Get existing cart from localStorage
    let cart = [];
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        cart = JSON.parse(savedCart);
      }
    } catch (error) {
      console.error('Error parsing cart:', error);
    }
    
    // Check if product is already in cart
    const existingItemIndex = cart.findIndex((item: any) => item.id === product._id);
    
    if (existingItemIndex >= 0) {
      // If product exists, increase quantity
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Otherwise add new item
      cart.push({
        id: product._id,
        name: product.name,
        price: product.discountedPrice > 0 ? product.discountedPrice : product.price,
        image: product.images[0]?.url || '',
        quantity: quantity
      });
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
    
    // Optionally redirect to cart or show confirmation
    
  };
  
  // Calculate discount percentage
  const discount = product && product.discountedPrice > 0 && product.price > 0
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;
  
  const handlePreviousImage = () => {
    if (!product || !product.images.length) return;
    
    setCurrentImageIndex(prevIndex => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };
  
  const handleNextImage = () => {
    if (!product || !product.images.length) return;
    
    setCurrentImageIndex(prevIndex => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Product image gallery
  const renderImageGallery = () => {
    if (!product || (!product.images || product.images.length === 0) && (!product.videos || product.videos.length === 0)) {
      return (
        <div className="aspect-square bg-gray-100 rounded-lg">
          <Image
            src="/placeholder-image.jpg"
            alt="Product placeholder"
            width={600}
            height={800}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      );
    }
    
    return (
      <div>
        <div className="relative aspect-square overflow-hidden">
          {currentImageIndex < product.images.length ? (
            <Image
              src={product.images[currentImageIndex]?.url || '/placeholder-image.jpg'}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              width={600}
              height={800}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <video 
              src={product.videos[currentImageIndex - product.images.length]?.url} 
              controls
              className="w-full h-full object-contain rounded-lg"
            />
          )}
          
          {product.images.length > 1 && (
            <>
              <button 
                onClick={handlePreviousImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full"
                aria-label="Previous image"
              >
                <FiChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full"
                aria-label="Next image"
              >
                <FiChevronRight size={20} />
              </button>
            </>
          )}
        </div>
        
        {/* Thumbnail navigation */}
        {product.images.length > 1 && (
          <div className="flex space-x-2 mt-4 overflow-x-auto py-2">
            {product.images.map((image, index) => (
              <button 
                key={index} 
                onClick={() => setCurrentImageIndex(index)}
                className={`w-16 h-16 flex-shrink-0 ${currentImageIndex === index ? 'ring-2 ring-black' : 'opacity-70'}`}
              >
                <Image
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Fetch related products
  const fetchRelatedProducts = async (productType: string) => {
    try {
      const response = await fetch(`/api/products?productType=${productType}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch related products');
      }
      
      const data = await response.json();
      
      if (data.success && data.products) {
        // Filter out the current product and limit to 8 products
        const filtered = data.products
          .filter((p: any) => p._id !== id)
          .slice(0, 8)
          .map((p: any) => ({
            _id: p._id,
            name: p.name,
            description: p.description || "No description available",
            price: p.price,
            discountedPrice: p.comparePrice || 0,
            category: p.category || "Perfume",
            brand: p.brand || 'A V I T O   S C E N T S',
            images: p.images ? 
              p.images.map((img: string) => ({ url: img })) : 
              [{ url: p.mainImage || 'https://placehold.co/600x800/222/fff?text=Product' }],
            stock: p.quantity || 0,
            productType: p.productType || 'Eau de Parfum',
            volumeRaw: p.volume // Store original volume for unit determination
          }));
        
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {error || 'Product not found'}
          </h2>
          <Link href="/" className="mt-4 inline-block text-black underline">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-gray-500 hover:text-black">
                Home
              </Link>
            </li>
            <li>
              <span className="text-gray-500 mx-2">/</span>
            </li>
            <li>
              <Link href={`/category/${product.category.toLowerCase()}`} className="text-gray-500 hover:text-black">
                {product.category}
              </Link>
            </li>
            <li>
              <span className="text-gray-500 mx-2">/</span>
            </li>
            <li className="text-black font-medium truncate max-w-[180px]">
              {product.name}
            </li>
          </ol>
        </nav>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            {renderImageGallery()}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-medium text-black font-lastica">{product.name}</h1>
              <div className="text-sm text-gray-500 mt-1">{product.brand} | {product.concentration}</div>
            </div>
            
            {/* Price */}
            <div className="flex items-center flex-wrap">
              {product.discountedPrice > 0 ? (
                <>
                  <span className="text-2xl font-medium text-black mr-3">₹{product.discountedPrice.toFixed(2)}</span>
                  <span className="text-sm text-gray-500 line-through mr-3">MRP ₹{product.price.toFixed(2)}</span>
                  {discount > 0 && <span className="text-sm text-green-700">({discount}% OFF)</span>}
                </>
              ) : (
                <span className="text-2xl font-medium text-black">₹{product.price.toFixed(2)}</span>
              )}
            </div>
            
            {/* Stock status */}
            <div>
              {product.stock > 0 ? (
                <span className="text-sm font-medium text-green-700">In Stock</span>
              ) : (
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              )}
            </div>
            
            {/* Quantity selector */}
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-3">Quantity</span>
              <div className="flex border border-gray-300">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 border-r border-gray-300"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  max={product.stock}
                  value={quantity} 
                  onChange={e => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-12 text-center py-1 focus:outline-none"
                />
                <button 
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  className="px-3 py-1 border-l border-gray-300"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              {/* Volume next to quantity */}
              <span className="ml-4 flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white text-xs font-semibold shadow-md border border-gray-700">
                  <span className="mr-1 opacity-70">Volume:</span>
                  <span className="font-bold">{product.volumeRaw || (product.size ? `${product.size}${product.volumeRaw?.toLowerCase().includes('gm') ? ' Gm' : ' ml'}` : '50ml')}</span>
                </span>
              </span>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col space-y-3">
              {/* Action buttons */}
              <div className="flex flex-col md:flex-row gap-4 mt-6">
                <AddToCartButton
                  productId={product._id}
                  productName={product.name}
                  productPrice={product.discountedPrice > 0 ? product.discountedPrice : product.price}
                  productImage={product.images[0]?.url || ''}
                  className="bg-black text-white py-3 px-6 hover:bg-gray-800 flex-1 text-center"
                />
                
                {/* Buy Now button */}
                <button 
                  onClick={handleAddToCart}
                  className="border border-black py-3 px-6 hover:bg-gray-100 flex-1"
                >
                  Buy Now
                </button>
              </div>
              
              {/* Removed AddToWishlistButton */}
            </div>
            
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium uppercase mb-2">Description</h3>
              <p className="text-gray-700 ">{product.description}</p>
            </div>
            
            {/* Bullet Points */}
            {product.bulletPoints && product.bulletPoints.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium uppercase mb-2">Key Features</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {product.bulletPoints.map((point, index) => (
                    <li key={index} className="text-gray-700">{point}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Fragrance Notes / Product Attributes */}
            {product.fragrance_notes && (
              <div>
                <h3 className="text-sm font-medium uppercase mb-2">
                  {product.productType === 'Air Fresheners' ? 'Product Attributes' : 'Fragrance Notes'}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs text-gray-500">
                      {product.productType === 'Air Fresheners' ? 'Use For' : 'Gender'}
                    </h4>
                    <ul className="mt-1 text-sm">
                      {product.fragrance_notes.top.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500">Volume</h4>
                    <ul className="mt-1 text-sm">
                      {product.fragrance_notes.middle.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500">
                      {product.productType === 'Air Fresheners' ? 'Type' : 'Fragrance'}
                    </h4>
                    <ul className="mt-1 text-sm">
                      {product.fragrance_notes.base.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium uppercase mb-3">Product Details</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-2 text-gray-500">Size</td>
                    <td className="py-2">
                      {product.size}
                      {(() => {
                        // Try to get the original unit from data.product.volume
                        // We don't have direct access to data.product.volume here, but we can store it in the product object
                        // So, let's add 'volumeRaw' to the product object in fetchProduct
                        // For now, fallback to 'ml' if not available
                        // @ts-ignore
                        const unit = product.volumeRaw?.toLowerCase().includes('gm') ? ' Gm' : ' ml';
                        return unit;
                      })()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Concentration</td>
                    <td className="py-2">{product.concentration}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">
                      {product.productType === 'Air Fresheners' ? 'Use For' : 'Gender'}
                    </td>
                    <td className="py-2">
                      {product.productType === 'Air Fresheners' 
                        ? (product.category || product.gender) 
                        : product.gender
                      }
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Category</td>
                    <td className="py-2">{product.category}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Brand</td>
                    <td className="py-2">{product.brand}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pb-20 border-t border-gray-200 pt-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl text-center font-medium text-black mb-8">
              Related Products
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4  gap-6">
              {relatedProducts.slice(0, 8).map((relatedProduct) => (
                <div key={relatedProduct._id} className="h-full flex flex-col bg-gray-100 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="relative overflow-hidden group">
                    <Link href={`/product/${relatedProduct._id}`}>
                      <Image 
                        src={relatedProduct.images[0]?.url || '/placeholder-image.jpg'} 
                        alt={relatedProduct.name}
                        width={300}
                        height={400}
                        className="w-full h-64 object-contain object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                    {relatedProduct.discountedPrice > 0 && (
                      <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded">
                        ON SALE
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <div className="relative mb-1">
                      <h3 className="font-medium text-sm font-lastica">
                        <Link href={`/product/${relatedProduct._id}`} className="hover:text-gray-700 font-lastica">
                          {relatedProduct.name}
                        </Link>
                      </h3>
                      {relatedProduct.volumeRaw && (
                        <span className="absolute top-0 right-0 text-xs bg-white px-2 py-0.5 rounded shadow border border-gray-200 font-semibold">
                          {relatedProduct.volumeRaw}
                        </span>
                      )}
                      {!relatedProduct.volumeRaw && (
                        <span className="absolute top-0 right-0 text-xs bg-white px-2 py-0.5 rounded shadow border border-gray-200 font-semibold">
                          ml
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mb-1">{relatedProduct.productType}</p>
                    
                    <div className="mt-auto flex justify-between pb-2 items-center">
                      <div className="flex items-baseline">
                        {relatedProduct.discountedPrice > 0 ? (
                          <>
                            <span className="text-sm font-bold text-red-600">₹{relatedProduct.discountedPrice.toFixed(2)}</span>
                            <span className="text-xs text-gray-400 line-through ml-2">
                              MRP ₹{relatedProduct.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold">₹{relatedProduct.price.toFixed(2)}</span>
                        )}
                      </div>
                      
                    </div>
                    <AddToCartButton
                      productId={relatedProduct._id}
                      productName={relatedProduct.name}
                      productPrice={relatedProduct.discountedPrice > 0 ? relatedProduct.discountedPrice : relatedProduct.price}
                      productImage={relatedProduct.images[0]?.url || ''}
                      className="w-full bg-black text-white py-2 px-4 rounded mb-2 hover:bg-gray-800 text-xs"
                      showIcon={true}
                    />
                  </div>

                </div>
                
              ))}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}