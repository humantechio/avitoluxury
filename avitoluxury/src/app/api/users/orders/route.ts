import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '../../../lib/mongodb';
import Order from '../../../models/Order';
import { getSession } from '../../../lib/server-auth-exports';

// GET orders for the current logged-in user
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to database
    await connectMongoDB();
    
    // Get query parameters for filtering and sorting
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const order = url.searchParams.get('order') || 'desc';
    
    // Build query
    const query: any = { user: session.userId };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Execute query with sorting
    const orders = await Order.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .populate('items.product', 'name images')
      .exec();
    
    return NextResponse.json({ 
      success: true, 
      orders 
    });
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' }, 
      { status: 500 }
    );
  }
} 