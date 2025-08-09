import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import User from '@/app/models/User';
import Product from '@/app/models/Product';
import Order from '@/app/models/Order';
import Contact from '@/app/models/Contact';
import { verifyAdminToken } from '@/app/lib/auth-utils';

export async function GET(request: Request) {
  // Subdomain restriction: Only allow requests from admin.avitoluxury.in
  // const host = request.headers.get('host');
  // if (host !== 'admin.avitoluxury.in') {
  //   return NextResponse.json({ error: 'Forbidden: Admin panel only accessible via admin.avitoluxury.in' }, { status: 403 });
  // }
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const isValidAdmin = await verifyAdminToken(token);

    if (!isValidAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Get counts from all collections
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalContacts,
      pendingContacts,
      recentOrders
    ] = await Promise.all([
      User.countDocuments({}),
      Product.countDocuments({}),
      Order.countDocuments({}),
      Contact.countDocuments({}),
      Contact.countDocuments({ status: 'pending' }),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
    ]);

    // Format the recent orders data
    const formattedRecentOrders = recentOrders.map(order => ({
      _id: order._id.toString(),
      orderNumber: `ORD-${order._id.toString().substr(-6)}`,
      customer: {
        name: order.user ? (order.user as any).name : 'Guest Customer',
        email: order.user ? (order.user as any).email : 'N/A'
      },
      createdAt: order.createdAt,
      status: order.status,
      totalAmount: order.totalPrice,
      total: order.totalPrice
    }));

    // Construct dashboard data
    const dashboardData = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalContacts,
      pendingContacts,
      recentOrders: formattedRecentOrders
    };

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 