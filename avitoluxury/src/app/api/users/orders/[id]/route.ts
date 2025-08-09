import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import User from '../../../../models/User';
import { getSession } from '../../../../lib/server-auth-exports';

// GET a specific order by ID (only for the authenticated user)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to database
    await connectMongoDB();
    
    // Get order ID from params
    const { id } = params;
    
    // Validate the order ID
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    console.log(`Fetching order ${id} for user ${session.userId}`);
    
    // Find order by ID and check ownership
    let order = await Order.findOne({
      _id: id,
      user: session.userId
    });
    
    // If order not found or doesn't belong to this user
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Get user info separately to ensure we have the email
    const user = await User.findById(session.userId, 'email name');
    
    // Create a complete response with user info
    const orderData = order.toObject();
    
    // Add user data to the order
    orderData.user = user ? {
      _id: user._id,
      email: user.email,
      name: user.name
    } : {
      _id: session.userId,
      email: session.email || "Unknown email",
      name: session.name || "Unknown user"
    };
    
    // Get product details if needed
    await Order.populate(order, {
      path: 'items.product',
      select: 'name images'
    });
    
    return NextResponse.json({ 
      success: true, 
      order: orderData
    });
  } catch (error: any) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' }, 
      { status: 500 }
    );
  }
}

// PUT - Update order status (for canceling an order)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to database
    await connectMongoDB();
    
    // Get order ID from params
    const { id } = params;
    
    // Validate the order ID
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Get request body with status update
    const body = await req.json();
    const { status } = body;
    
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }
    
    // Check if status is valid (for user, only allow cancellation)
    if (status !== 'Cancelled') {
      return NextResponse.json({ 
        error: 'Invalid status update. Users can only cancel orders.' 
      }, { status: 400 });
    }
    
    // Find order by ID and check ownership
    const order = await Order.findOne({
      _id: id,
      user: session.userId
    });
    
    // If order not found or doesn't belong to this user
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check if order can be cancelled (not delivered, not already cancelled)
    if (order.isDelivered || order.status === 'Delivered' || order.status === 'Cancelled') {
      return NextResponse.json({ 
        error: 'This order cannot be cancelled' 
      }, { status: 400 });
    }
    
    console.log(`Cancelling order ${id} for user ${session.userId}`);
    
    // Update the order status
    order.status = status;
    await order.save();
    
    // Get user info for the response
    const user = await User.findById(session.userId, 'email name');
    
    // Create a complete response with user info
    const orderData = order.toObject();
    
    // Add user data to the order
    orderData.user = user ? {
      _id: user._id,
      email: user.email,
      name: user.name
    } : {
      _id: session.userId,
      email: session.email || "Unknown email",
      name: session.name || "Unknown user"
    };
    
    return NextResponse.json({ 
      success: true, 
      order: orderData 
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order' }, 
      { status: 500 }
    );
  }
} 