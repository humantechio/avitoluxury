import { NextResponse } from 'next/server';
import { encrypt } from '@/app/lib/server-auth';
import connectMongoDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import AdminOTP from '@/app/models/AdminOTP';
import { Types } from 'mongoose';

export async function POST(request: Request) {
  try {
    // Get email and OTP from request body
    const { email, otp } = await request.json();
    
    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectMongoDB();
    
    // Find OTP in database
    const otpDoc = await AdminOTP.findOne({ 
      email: email.toLowerCase(),
      otp
    });
    
    // If OTP not found or expired
    if (!otpDoc) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP. Please try again.' },
        { status: 400 }
      );
    }
    
    // Check if OTP is expired
    if (new Date() > otpDoc.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }
    
    // Find admin user
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role: 'admin' 
    });
    
    // Double-check user exists and is admin
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found or not an admin' },
        { status: 404 }
      );
    }
    
    // Delete the used OTP
    await AdminOTP.deleteOne({ _id: otpDoc._id });
    
    // Create JWT token
    const userId = user._id instanceof Types.ObjectId 
      ? user._id.toString() 
      : String(user._id);
      
    const token = await encrypt({ 
      email: user.email,
      name: user.name,
      role: user.role,
      userId
    });
    
    // Return success with token and user data
    return NextResponse.json({ 
      success: true,
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        userId
      }
    });
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 