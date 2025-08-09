import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import Order from '@/app/models/Order';
import User from '@/app/models/User'; // Add User model import

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const trackingId = url.searchParams.get('tracking_id');
    
    if (!trackingId) {
      return NextResponse.json(
        { success: false, error: 'Tracking ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find order by tracking ID
    const order = await Order.findOne({ trackingId }).populate('user', 'email');
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Format order data for response
    const formattedOrder = {
      trackingId: order.trackingId,
      status: order.status,
      createdAt: order.createdAt,
      shippingAddress: {
        fullName: order.shippingAddress.fullName,
        address: order.shippingAddress.address,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        phone: order.shippingAddress.phone
      },
      items: order.items.map((item: any) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '/perfume-placeholder.jpg'
      })),
      paymentMethod: order.paymentMethod,
      totalPrice: order.totalPrice,
      shippingPrice: order.shippingPrice,
      isPaid: order.isPaid,
      paidAt: order.paidAt,
      isDelivered: order.isDelivered,
      deliveredAt: order.deliveredAt,
      alternatePhone: order.alternatePhone
    };
    
    return NextResponse.json({
      success: true,
      order: formattedOrder
    });
    
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track order' },
      { status: 500 }
    );
  }
} 