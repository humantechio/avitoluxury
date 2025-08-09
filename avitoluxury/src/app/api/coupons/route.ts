import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';

// Connect to MongoDB
const connectMongo = async () => {
  try {
    await mongoose.connect("mongodb+srv://Yash:8BQEkh4JaATCGblO@yash.pweao0h.mongodb.net/ecommerce");
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
  }
};

// Define a simple in-memory coupon database with strong typing
// In a production app, you would store these in MongoDB
interface Coupon {
  code: string;
  discount: number;
  freeShipping: boolean;
  minOrderValue: number;
  description: string;
  active: boolean;
}

const COUPONS: Record<string, Coupon> = {
  'bsdk50012': {
    code: 'bsdk50012',
    discount: 100,
    freeShipping: true,
    minOrderValue: 0,
    description: 'Rs 100 off + Free Shipping',
    active: true
  }
};

// GET /api/coupons - Get all coupons (admin only)
export async function GET(request: Request) {
  try {
    // In a real app, you would validate admin permissions here
    
    // Return all coupons
    return NextResponse.json({
      success: true,
      coupons: Object.values(COUPONS)
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch coupons' 
    }, { status: 500 });
  }
}

// POST /api/coupons - Validate a coupon code
export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ 
        success: false, 
        error: 'Coupon code is required' 
      }, { status: 400 });
    }
    
    // Check if coupon exists and is active
    const coupon = COUPONS[code.toLowerCase()];
    
    if (!coupon || !coupon.active) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired coupon code' 
      }, { status: 400 });
    }
    
    // Return coupon details
    return NextResponse.json({ 
      success: true, 
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        freeShipping: coupon.freeShipping,
        description: coupon.description
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to validate coupon' 
    }, { status: 500 });
  }
} 