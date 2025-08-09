import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import Cart from '@/app/models/Cart';
import Product from '@/app/models/Product';
import mongoose from 'mongoose';

// Define types for cart items
interface CartItem {
  product: mongoose.Types.ObjectId | string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  _id?: string;
}

interface CartDocument {
  user: string;
  items: CartItem[];
  subtotal: number;
  _id?: string;
  save: () => Promise<any>;
}

interface ProductDocument {
  _id: string;
  name: string;
  price: number;
  images: { url: string }[];
  mainImage?: string;
}

// Helper function to extract user ID from cookies
const getUserIdFromCookies = (cookie: string) => {
  const userDataCookieMatch = cookie.match(/userData=([^;]+)/);
  if (!userDataCookieMatch) return null;
  
  try {
    const userData = JSON.parse(decodeURIComponent(userDataCookieMatch[1]));
    return userData.userId;
  } catch (err) {
    console.error('Error parsing user data from cookie:', err);
    return null;
  }
};

// Helper function to create headers with cache control
const createNoCacheHeaders = () => {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };
};

// Helper function to get the best available product image URL
const getProductImageUrl = (product: any) => {
  // Get the best available image URL
  let imageUrl = '';
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    if (typeof product.images[0] === 'string') {
      imageUrl = product.images[0];
    } else if (product.images[0]?.url) {
      imageUrl = product.images[0].url;
    }
  }
  // Fallback to mainImage if available
  if (!imageUrl && product.mainImage) {
    imageUrl = product.mainImage;
  }
  
  return imageUrl || '/images/placeholder-product.jpg';
};

// GET endpoint to fetch user's cart
export async function GET(request: Request) {
  try {
    // Get user ID from cookies
    const cookie = request.headers.get('cookie') || '';
    const isLoggedIn = cookie.includes('isLoggedIn=true');
    
    if (!isLoggedIn) {
      // For non-authenticated users, return an empty cart structure
      // The client will use localStorage for cart management
      return NextResponse.json({ 
        success: true, 
        cart: {
          items: [],
          subtotal: 0
        }
      }, { 
        status: 200,
        headers: createNoCacheHeaders()
      });
    }
    
    const userId = getUserIdFromCookies(cookie);
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User data not found' 
      }, { status: 401 });
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Special handling for admin-bypass-user-id
    if (userId === 'admin-bypass-user-id') {
      console.log('Admin user detected, returning empty cart');
      // For admin users, return an empty cart
      return NextResponse.json({
        success: true,
        cart: {
          items: [],
          subtotal: 0
        }
      }, {
        headers: createNoCacheHeaders()
      });
    }
    
    // For normal users, attempt to get real cart data
    console.log(`Fetching cart for user: ${userId}`);
    
    // Find user's cart
    let cart = await Cart.findOne({ user: userId }) as CartDocument;
    
    // If no cart exists, create an empty one
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        subtotal: 0
      });
      await cart.save();
    }
    
    // Return cart data
    return NextResponse.json({
      success: true,
      cart: {
        items: cart.items.map((item: CartItem) => ({
          id: item.product.toString(),
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        subtotal: cart.subtotal
      }
    }, {
      headers: createNoCacheHeaders()
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error',
      cart: {
        items: [],
        subtotal: 0
      }
    }, { 
      status: 500,
      headers: createNoCacheHeaders()
    });
  }
}

// POST endpoint to add/update cart items
export async function POST(request: Request) {
  try {
    // Get user ID from cookies
    const cookie = request.headers.get('cookie') || '';
    const isLoggedIn = cookie.includes('isLoggedIn=true');
    
    if (!isLoggedIn) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }
    
    const userId = getUserIdFromCookies(cookie);
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User data not found' 
      }, { status: 401 });
    }
    
    // Parse request body
    const { productId, quantity } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product ID is required' 
      }, { status: 400 });
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find product
    const product = await Product.findById(productId) as ProductDocument;
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    // Find or create user's cart
    let cart = await Cart.findOne({ user: userId }) as CartDocument;
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        subtotal: 0
      });
    }
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: CartItem) => item.product.toString() === productId
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if product exists
      cart.items[existingItemIndex].quantity = quantity || cart.items[existingItemIndex].quantity + 1;
    } else {
      // Add new item if product doesn't exist
      cart.items.push({
        product: productId,
        quantity: quantity || 1,
        price: product.price,
        name: product.name,
        image: getProductImageUrl(product)
      });
    }
    
    // Calculate subtotal
    cart.subtotal = cart.items.reduce(
      (sum: number, item: CartItem) => sum + (item.price * item.quantity),
      0
    );
    
    // Save cart
    await cart.save();
    
    // Return updated cart
    return NextResponse.json({
      success: true,
      cart: {
        items: cart.items.map((item: CartItem) => ({
          id: item.product.toString(),
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        subtotal: cart.subtotal
      }
    }, {
      headers: createNoCacheHeaders()
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { 
      status: 500,
      headers: createNoCacheHeaders()
    });
  }
}

// DELETE endpoint to remove item from cart
export async function DELETE(request: Request) {
  try {
    // Get user ID from cookies
    const cookie = request.headers.get('cookie') || '';
    const isLoggedIn = cookie.includes('isLoggedIn=true');
    
    if (!isLoggedIn) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }
    
    const userId = getUserIdFromCookies(cookie);
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User data not found' 
      }, { status: 401 });
    }
    
    // Get product ID from URL params
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product ID is required' 
      }, { status: 400 });
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId }) as CartDocument;
    
    if (!cart) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cart not found' 
      }, { status: 404 });
    }
    
    // Remove item from cart
    cart.items = cart.items.filter(
      (item: CartItem) => item.product.toString() !== productId
    );
    
    // Recalculate subtotal
    cart.subtotal = cart.items.reduce(
      (sum: number, item: CartItem) => sum + (item.price * item.quantity),
      0
    );
    
    // Save cart
    await cart.save();
    
    // Return updated cart
    return NextResponse.json({
      success: true,
      cart: {
        items: cart.items.map((item: CartItem) => ({
          id: item.product.toString(),
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        subtotal: cart.subtotal
      }
    }, {
      headers: createNoCacheHeaders()
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { 
      status: 500,
      headers: createNoCacheHeaders()
    });
  }
}

// PUT endpoint to update the entire cart
export async function PUT(request: Request) {
  try {
    // Get user ID from cookies
    const cookie = request.headers.get('cookie') || '';
    const isLoggedIn = cookie.includes('isLoggedIn=true');
    
    if (!isLoggedIn) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }
    
    const userId = getUserIdFromCookies(cookie);
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User data not found' 
      }, { status: 401 });
    }
    
    // Parse request body
    const { items } = await request.json();
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid cart items' 
      }, { status: 400 });
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find or create user's cart
    let cart = await Cart.findOne({ user: userId }) as CartDocument;
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        subtotal: 0
      });
    }
    
    // Clear current items
    cart.items = [];
    
    // Add new items
    for (const item of items) {
      if (!item.id || !item.quantity) continue;
      
      // Find product
      const product = await Product.findById(item.id) as ProductDocument;
      if (!product) continue;
      
      // Add to cart
      cart.items.push({
        product: item.id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image: getProductImageUrl(product)
      });
    }
    
    // Calculate subtotal
    cart.subtotal = cart.items.reduce(
      (sum: number, item: CartItem) => sum + (item.price * item.quantity),
      0
    );
    
    // Save cart
    await cart.save();
    
    // Return updated cart
    return NextResponse.json({
      success: true,
      cart: {
        items: cart.items.map((item: CartItem) => ({
          id: item.product.toString(),
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        subtotal: cart.subtotal
      }
    }, {
      headers: createNoCacheHeaders()
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { 
      status: 500,
      headers: createNoCacheHeaders()
    });
  }
}

export const dynamic = 'force-dynamic'; 