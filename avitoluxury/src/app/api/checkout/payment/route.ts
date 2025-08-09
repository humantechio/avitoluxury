import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import Order from '@/app/models/Order';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find order
    const order = await Order.findById(orderId).populate('user');
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Get Razorpay credentials
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });
    
    // Calculate amount in paise
    const amountInPaise = Math.round(order.totalPrice * 100);
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order._id.toString(),
      notes: {
        orderId: order._id.toString(),
        trackingId: order.trackingId
      }
    });
    
    // Update order with Razorpay order ID
    order.paymentResult = {
      ...order.paymentResult || {},
      razorpayOrderId: razorpayOrder.id
    };
    
    await order.save();
    
    // Return payment details
    return NextResponse.json({
      success: true,
      key_id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpayOrderId: razorpayOrder.id,
      customerName: order.shippingAddress.fullName,
      customerEmail: order.user?.email || '',
      customerPhone: order.shippingAddress.phone
    });
    
  } catch (error) {
    console.error('Error initializing payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
} 