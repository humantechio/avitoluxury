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
    
    if (!userId) {
      console.error('Invoice API: User not authenticated');
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }
    
    await connectMongoDB();
    
    // Create the query - for admin show any order, for regular users show only their orders
    let query = {};
    if (userId === 'admin-bypass-user-id') {
      // Admin can view any order
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { _id: new mongoose.Types.ObjectId(id) };
      } else {
        query = { orderId: id };
      }
    } else {
      // Regular users can only view their own orders
      if (mongoose.Types.ObjectId.isValid(id)) {
        query = { _id: new mongoose.Types.ObjectId(id), user: userId };
      } else {
        query = { orderId: id, user: userId };
      }
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
    if (order.status !== 'Delivered' && userId !== 'admin-bypass-user-id') {
      console.error('Invoice API: Order is not delivered yet');
      return NextResponse.json({ 
        success: false, 
        error: 'Invoice is only available for delivered orders' 
      }, { status: 400 });
    }
    
    // Get order items and calculate totals if needed
    const orderItems = order.items || order.orderItems || [];
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
      orderId: order.orderId || order._id.toString(),
      invoiceNumber: `INV-${order._id.toString().slice(-8)}`,
      date: order.createdAt,
      deliveryDate: order.deliveredAt || new Date(),
      customer: {
        name: order.shippingAddress?.fullName || (order.user?.name || 'Customer'),
        email: order.user?.email || 'Not provided',
        phone: order.shippingAddress?.phone || 'Not provided',
        address: {
          line1: order.shippingAddress?.address,
          city: order.shippingAddress?.city,
          state: order.shippingAddress?.state || '',
          postalCode: order.shippingAddress?.postalCode,
          country: order.shippingAddress?.country
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
    const userDataCookieMatch = cookie.match(/userData=([^;]+)/);
    
    if (!userDataCookieMatch) {
      return null;
    }
    
    const userData = JSON.parse(decodeURIComponent(userDataCookieMatch[1]));
    return userData.userId;
  } catch (err) {
    console.error('Error parsing user data from cookie:', err);
    return null;
  }
}; 