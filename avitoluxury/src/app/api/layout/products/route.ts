import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import Product from '@/app/models/Product';

// GET layout products (simplified endpoint)
export async function GET() {
  try {
    await connectMongoDB();
    
    const products = await Product.find()
      .select('_id name price images')
      .limit(8)
      .lean();
    
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error('Error in layout products API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Server error',
      products: []
    }, { status: 500 });
  }
} 