import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Coupon from '../../../models/Coupon';

// Connect to MongoDB
const connectMongo = async () => {
  try {
    await mongoose.connect("mongodb+srv://Yash:8BQEkh4JaATCGblO@yash.pweao0h.mongodb.net/ecommerce");
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
};

type RouteParams = {
  params: {
    id: string;
  };
};

// GET a single coupon by ID
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = context.params;
    await connectMongo();
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// UPDATE a coupon by ID
export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = context.params;
    await connectMongo();
    const body = await request.json();
    
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// DELETE a coupon by ID
export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = context.params;
    await connectMongo();
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
} 