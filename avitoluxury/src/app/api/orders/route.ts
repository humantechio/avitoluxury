import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/app/models/Order';
import connectMongoDB from '@/app/lib/mongodb';
import { cookies } from 'next/headers';
import User from '@/app/models/User';
import Cart from '@/app/models/Cart';
import Product from '@/app/models/Product';

// GET all orders
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromCookies();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }
    
    await connectMongoDB();
    
    let orders;
    
    // For admin users, show all orders
    // For regular users, only show their own orders
    if (userId === 'admin-bypass-user-id') {
      // Admin user should see all orders
      orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'name email');
      console.log(`Found ${orders.length} orders in the database for admin view`);
      
      // Transform orders to match the format expected by the frontend
      orders = orders.map(order => {
        // Create a properly formatted order object
        const formattedOrder = {
          _id: order._id.toString(),
          id: order._id.toString(),
          orderNumber: order.orderId || `ORD-${order._id.toString().slice(-8)}`,
          status: order.status || 'Pending',
          total: order.totalPrice || 0,
          date: order.createdAt || order.paidAt || new Date(),
          customer: {
            id: order.user?._id?.toString() || 'unknown',
            name: order.user?.name || order.shippingAddress?.fullName || 'Unknown Customer',
            email: order.user?.email || 'No Email',
            phone: order.shippingAddress?.phone || 'No Phone'
          },
          items: (order.items || order.orderItems || []).map((item: any) => ({
            id: item.product?.toString() || 'unknown',
            name: item.name || 'Unknown Product',
            quantity: item.quantity || 1,
            price: item.price || 0,
            image: item.image || '/images/placeholder-product.jpg'
          }))
        };
        return formattedOrder;
      });
    } else {
      // Regular user should only see their own orders
      orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
      console.log(`Found ${orders.length} orders for user ${userId}`);
      
      // Format orders to include all necessary information
      orders = orders.map(order => {
        const orderItems = order.items || order.orderItems || [];
        let totalPrice = order.totalPrice || 0;
        
        // Calculate total price if it's missing or zero
        if (totalPrice === 0 && orderItems.length > 0) {
          totalPrice = orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) + (order.shippingPrice || 0);
        }
        
        return {
          _id: order._id.toString(),
          id: order._id.toString(),
          orderId: order.orderId,
          date: order.createdAt,
          status: order.status || 'Pending',
          total: totalPrice,
          itemsCount: orderItems.length,
          items: orderItems.map((item: any) => ({
            id: item.product?.toString() || 'unknown',
            name: item.name || 'Unknown Product',
            quantity: item.quantity || 1,
            price: item.price || 0,
            image: item.image || '/images/placeholder-product.jpg'
          }))
        };
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch orders' 
    }, { status: 500 });
  }
}

// Function to generate mock orders for development
function getMockOrders() {
  const mockOrders = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customer: {
        id: '101',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+91 98765 43210'
      },
      date: new Date().toISOString(),
      status: 'Pending',
      total: 1299.00,
      items: [
        {
          id: 'p1',
          name: 'Wild Escape 50ML',
          quantity: 1,
          price: 1299.00,
          image: 'https://placehold.co/80x80/eee/000?text=Wild+Escape'
        }
      ],
      shipping: {
        address: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
      },
      paymentMethod: 'cod',
      paymentStatus: 'unpaid',
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      customer: {
        id: '102',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+91 87654 32109'
      },
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'Processing',
      total: 2598.00,
      items: [
        {
          id: 'p2',
          name: 'Baked Vanilla 50ML',
          quantity: 1,
          price: 1299.00,
          image: 'https://placehold.co/80x80/eee/000?text=Baked+Vanilla'
        },
        {
          id: 'p3',
          name: 'Apple Lily 50ML',
          quantity: 1,
          price: 1299.00,
          image: 'https://placehold.co/80x80/eee/000?text=Apple+Lily'
        }
      ],
      shipping: {
        address: '456 Park Avenue',
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110001',
        country: 'India',
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      customer: {
        id: '103',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        phone: '+91 76543 21098'
      },
      date: new Date(Date.now() - 172800000).toISOString(),
      status: 'Shipped',
      total: 3897.00,
      items: [
        {
          id: 'p4',
          name: 'Lavender Dreams 100ML',
          quantity: 3,
          price: 1299.00,
          image: 'https://placehold.co/80x80/eee/000?text=Lavender+Dreams'
        }
      ],
      shipping: {
        address: '789 Lake View',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      },
      paymentMethod: 'online',
      paymentStatus: 'paid',
    }
  ];
  
  return mockOrders;
}

// POST a new order
export async function POST(request: Request) {
  try {
    // Get user ID from cookies
    const cookie = request.headers.get('cookie') || '';
    const userDataCookieMatch = cookie.match(/userData=([^;]+)/);
    
    if (!userDataCookieMatch) {
      console.error('Order API: No userData cookie found');
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }
    
    let userId;
    try {
      const parsedData = JSON.parse(decodeURIComponent(userDataCookieMatch[1]));
      userId = parsedData.userId;
      console.log('Order API: User ID from cookie:', userId);
    } catch (err) {
      console.error('Order API: Error parsing user data from cookie:', err);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid user data' 
      }, { status: 401 });
    }
    
    if (!userId) {
      console.error('Order API: No user ID found in cookie data');
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }
    
    // Parse request body
    const data = await request.json();
    const { 
      shippingAddress, 
      paymentMethod, 
      saveAddress = false,
      discountCode = '',
      discountAmount = 0,
      shippingPrice: customShippingPrice
    } = data;
    
    console.log('Order API: Received order data:', { shippingAddress, paymentMethod, saveAddress, discountCode, discountAmount });
    
    if (!shippingAddress || !paymentMethod) {
      console.error('Order API: Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: 'Shipping address and payment method are required' 
      }, { status: 400 });
    }
    
    console.log('Order API: Connecting to MongoDB');
    await connectMongoDB();
    
    // Get user cart
    console.log('Order API: Finding cart for user:', userId);
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      console.log('Order API: Cart is empty, checking localStorage');
      
      // If server cart is empty, check request body for cart items
      if (!data.cartItems || !Array.isArray(data.cartItems) || data.cartItems.length === 0) {
        console.error('Order API: No cart items found');
        return NextResponse.json({ 
          success: false, 
          error: 'Cart is empty' 
        }, { status: 400 });
      }
      
      // Create a new cart with the provided items
      const newCart = new Cart({
        user: userId,
        items: data.cartItems.map((item: any) => ({
          product: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        subtotal: data.cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
      });
      
      await newCart.save();
      console.log('Order API: Created new cart from provided items');
      
      // Use the new cart for order creation
      cart = newCart;
    }
    
    console.log('Order API: Cart found with', cart.items.length, 'items');
    
    // Calculate order totals
    const subtotal = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    // Use custom shipping price if provided, otherwise calculate based on subtotal
    const shippingPrice = typeof customShippingPrice === 'number' ? 
      customShippingPrice : 
      (subtotal > 500 ? 0 : 50); // Free shipping over 500
    
    // Apply discount if provided
    const discount = discountAmount || 0;
    
    // Calculate total with a minimum of 1 rupee
    let total = subtotal + shippingPrice - discount;
    total = Math.max(total, 1); // Ensure minimum amount is 1 rupee
    
    // Generate unique order ID
    const orderId = generateOrderId();
    console.log('Order API: Generated order ID:', orderId);
    
    // Create order with complete product details
    const orderItems = await Promise.all(cart.items.map(async (item: any) => {
      // Find the product to get all details
      let productDetails = null;
      if (item.product) {
        productDetails = await Product.findById(item.product);
        console.log('Order API: Found product details:', {
          id: productDetails?._id?.toString(),
          name: productDetails?.name,
          sku: productDetails?.sku,
          productType: productDetails?.productType,
          category: productDetails?.category,
          subCategories: productDetails?.subCategories,
          volume: productDetails?.volume
        });
      } else {
        console.log('Order API: No product ID found for item:', item.name);
      }
      
      // If product details are null, try to find by name as fallback
      if (!productDetails && item.name) {
        productDetails = await Product.findOne({ name: item.name });
        console.log('Order API: Fallback - Found product by name:', !!productDetails);
      }
      
      return {
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        // Add complete product details with proper fallbacks
        sku: productDetails?.sku || '',
        productType: productDetails?.productType || '',
        category: productDetails?.category || '',
        subCategory: Array.isArray(productDetails?.subCategories) && productDetails?.subCategories.length > 0 
          ? productDetails?.subCategories[0] 
          : '',
        volume: productDetails?.volume || '',
        gender: productDetails?.gender || ''
      };
    }));

    const order = new Order({
      user: userId,
      trackingId: orderId, // Use trackingId field instead of orderId
      orderId, // Keep orderId for backward compatibility
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult: paymentMethod === 'COD' ? {
        status: 'Pending',
        method: 'Cash on Delivery'
      } : {
        status: 'Pending',
        method: 'Online Payment'
      },
      itemsPrice: subtotal,
      shippingPrice,
      discountPrice: discount,
      couponCode: discountCode || undefined,
      totalPrice: total,
      isPaid: false,
      paidAt: paymentMethod === 'COD' ? null : new Date(),
      isDelivered: false
    });
    
    // Save order
    console.log('Order API: Saving order');
    const savedOrder = await order.save();
    console.log('Order API: Order saved successfully');
    
    // Save address to user profile if requested
    if (saveAddress) {
      console.log('Order API: Saving address to user profile');
      await User.findByIdAndUpdate(
        userId,
        { 
          $push: { 
            addresses: {
              addressId: new mongoose.Types.ObjectId().toString(),
              fullName: shippingAddress.fullName,
              addressLine1: shippingAddress.address,
              city: shippingAddress.city,
              state: shippingAddress.state || '',
              pincode: shippingAddress.postalCode,
              country: shippingAddress.country,
              phone: shippingAddress.phone,
              isDefault: false
            } 
          } 
        }
      );
    }
    
    // Clear cart after successful order
    cart.items = [];
    cart.subtotal = 0;
    await cart.save();
    console.log('Order API: Cart cleared');
    
    return NextResponse.json({ 
      success: true, 
      order: {
        orderId: savedOrder.orderId,
        _id: savedOrder._id,
        totalPrice: savedOrder.totalPrice,
        paymentMethod: savedOrder.paymentMethod
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Order API: Error creating order:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create order' 
    }, { status: 500 });
  }
}

// API endpoint to update order status
export async function PATCH(request: Request) {
  try {
    const { orderId, status } = await request.json();
    
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }
    
    // Connect to database
    await connectMongoDB();
    
    // Create query to handle different ID formats
    let query;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      query = { _id: new mongoose.Types.ObjectId(orderId) };
    } else {
      // Try to find by orderId field if not a valid ObjectId
      query = { orderId };
    }
    
    console.log(`Updating order status for: ${JSON.stringify(query)} to ${status}`);
    
    // Find the order first to check if it's being marked as delivered
    const existingOrder = await Order.findOne(query).populate('user', 'name email');
    
    if (!existingOrder) {
      console.error(`Order not found with query: ${JSON.stringify(query)}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const wasDelivered = existingOrder.status === 'Delivered';
    const isBeingMarkedAsDelivered = status === 'Delivered' && !wasDelivered;
    
    // Update order status
    const order = await Order.findOneAndUpdate(
      query,
      { 
        status,
        ...(isBeingMarkedAsDelivered ? { isDelivered: true, deliveredAt: new Date() } : {})
      },
      { new: true }
    );
    
    console.log(`Successfully updated order ${order._id} status to ${status}`);
    
    // Send SMS notification if order is being marked as delivered
    if (isBeingMarkedAsDelivered) {
      try {
        // Get customer phone number from shipping address
        const phone = existingOrder.shippingAddress.phone;
        const customerName = existingOrder.shippingAddress.fullName.split(' ')[0]; // Get first name
        
        // Generate invoice link
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://avitoluxury.in';
        const invoiceLink = `${baseUrl}/invoice/${order._id}`;
        
        // Import the SMS utility
        const { sendOrderConfirmationSMS } = await import('@/app/lib/sms-utils');
        
        // Send the delivery confirmation SMS
        await sendOrderConfirmationSMS({
          phone,
          customerName,
          trackingId: existingOrder.trackingId,
          transactionId: existingOrder.paymentResult?.id || existingOrder._id.toString(),
          totalAmount: existingOrder.totalPrice,
          invoiceLink
        });
        
        console.log(`Delivery confirmation SMS sent to ${phone}`);
      } catch (smsError) {
        console.error('Failed to send delivery confirmation SMS:', smsError);
        // Don't fail the request if SMS sending fails
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      order: {
        id: order._id.toString(),
        status: order.status,
      }
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: (error as Error).message || 'Error updating order' }, { status: 500 });
  }
}

// Helper function to extract user ID from cookies
const getUserIdFromCookies = async () => {
  const cookieStore = await cookies();
  const userData = cookieStore.get('userData');
  
  if (!userData) return null;
  
  try {
    const parsedData = JSON.parse(userData.value);
    return parsedData.userId;
  } catch (err) {
    console.error('Error parsing user data from cookie:', err);
    return null;
  }
};

// Generate a unique order ID
const generateOrderId = () => {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}${random}`;
};