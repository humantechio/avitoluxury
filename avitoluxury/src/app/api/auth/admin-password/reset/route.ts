import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import AdminOTP from '@/app/models/AdminOTP';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // Get email, OTP, and new password from request body
    const { email, otp, newPassword } = await request.json();
    
    // Validate input
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
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
        { success: false, error: 'Invalid or expired OTP. Please request a new one.' },
        { status: 400 }
      );
    }
    
    // Check if OTP is expired
    if (new Date() > otpDoc.expiresAt) {
      await AdminOTP.deleteOne({ _id: otpDoc._id });
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
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();
    
    // Delete the used OTP
    await AdminOTP.deleteOne({ _id: otpDoc._id });
    
    // Return success
    return NextResponse.json({ 
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });
    
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 