import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/app/models/Order';
import connectMongoDB from '@/app/lib/mongodb';
import { cookies } from 'next/headers';

// Function to generate invoice for delivered orders
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('Invoice API: Generating invoice for order ID:', id);
    
    // Get user ID from cookies
    const userId = await getUserIdFromCookies(request);
    
    // Check if this is a public access request (via URL parameter)
    const url = new URL(request.url);
    const isPublic = url.searchParams.get('public') === 'true';
    
    if (!userId && !isPublic) {
      console.error('Invoice API: User not authenticated and not public access');
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }
    
    await connectMongoDB();
    
    // Create the query - for admin show any order, for regular users show only their orders
    let query = {};
    if (userId === 'admin-bypass-user-id' || isPublic) {
      // Admin or public access can view any order
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { _id: new mongoose.Types.ObjectId(id) };
      } else {
        query = { trackingId: id };
      }
    } else if (userId) {
      // Regular users can only view their own orders
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { _id: new mongoose.Types.ObjectId(id), user: userId };
      } else {
        query = { trackingId: id, user: userId };
      }
    } else {
      // No user ID and not public - should not reach here due to earlier check
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied' 
      }, { status: 403 });
    }
    
    // Find the order
    const order = await Order.findOne(query).populate('user', 'name email');
    
    if (!order) {
      console.error('Invoice API: Order not found with ID:', id);
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 });
    }
    
    // Check if order is delivered - only generate invoice for delivered orders
    if (order.status !== 'Delivered' && userId !== 'admin-bypass-user-id' && !isPublic) {
      console.error('Invoice API: Order is not delivered yet, current status:', order.status);
      return NextResponse.json({ 
        success: false, 
        error: `Invoice is only available for delivered orders. Current status: ${order.status}` 
      }, { status: 400 });
    }
    
    // Get order items and calculate totals if needed
    const orderItems = order.items || [];
    let subtotal = order.itemsPrice || 0;
    
    if (subtotal === 0 && orderItems.length > 0) {
      subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    const shippingPrice = order.shippingPrice || 0;
    const taxPrice = order.taxPrice || 0;
    const discountPrice = order.discountPrice || 0;
    const totalPrice = order.totalPrice || (subtotal + shippingPrice + taxPrice - discountPrice);
    
    // Create invoice data
    const invoice = {
      orderId: order.trackingId || order._id.toString(),
      invoiceNumber: `INV-${order._id.toString().slice(-8)}`,
      date: order.createdAt,
      deliveryDate: order.deliveredAt || new Date(),
      customer: {
        name: order.shippingAddress?.fullName || (order.user?.name || 'Customer'),
        email: order.user?.email || 'Not provided',
        phone: order.shippingAddress?.phone || 'Not provided',
        address: {
          line1: order.shippingAddress?.address || 'Not provided',
          city: order.shippingAddress?.city || 'Not provided',
          state: order.shippingAddress?.state || '',
          postalCode: order.shippingAddress?.postalCode || 'Not provided',
          country: order.shippingAddress?.country || 'India'
        }
      },
      items: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price || 0,
        total: (item.price || 0) * (item.quantity || 1)
      })),
      subtotal,
      shipping: shippingPrice,
      tax: taxPrice,
      discount: discountPrice,
      total: totalPrice,
      paymentMethod: order.paymentMethod
    };
    
    return NextResponse.json({ 
      success: true, 
      invoice
    });
  } catch (error) {
    console.error('Invoice API: Error generating invoice:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate invoice' 
    }, { status: 500 });
  }
}

// Helper function to extract user ID from cookies
const getUserIdFromCookies = async (request: Request) => {
  try {
    const cookie = request.headers.get('cookie') || '';
    console.log('Invoice API: Checking cookies for authentication');
    
    const userDataCookieMatch = cookie.match(/userData=([^;]+)/);
    
    if (!userDataCookieMatch) {
      console.log('Invoice API: No userData cookie found');
      return null;
    }
    
    const userData = JSON.parse(decodeURIComponent(userDataCookieMatch[1]));
    console.log('Invoice API: User authenticated with ID:', userData.userId);
    return userData.userId;
  } catch (err) {
    console.error('Invoice API: Error parsing user data from cookie:', err);
    return null;
  }
}; 