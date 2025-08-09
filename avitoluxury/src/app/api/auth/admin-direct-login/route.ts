import { NextResponse } from 'next/server';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';
import connectMongoDB from '@/app/lib/mongodb';
import { generateOTP, sendAdminOTP } from '@/app/lib/email-utils';
import AdminOTP from '@/app/models/AdminOTP';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    console.log('Admin direct login: Connecting to MongoDB...');
    await connectMongoDB();
    console.log('Admin direct login: MongoDB connected');
    
    // Get email and password from request
    const { email, password } = await request.json();
    console.log('Admin direct login attempt for email:', email);
    
    if (!email || !password) {
      console.log('Admin direct login: Missing email or password');
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find the user in the database
    console.log('Admin direct login: Finding user in database...');
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('Admin direct login: User found?', !!user);
    
    if (!user) {
      console.log('Admin direct login: User not found');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check if the user is an admin
    console.log('Admin direct login: User role:', user.role);
    if (user.role !== 'admin') {
      console.log('Admin direct login: User is not an admin');
      return NextResponse.json(
        { success: false, error: 'You do not have admin privileges' },
        { status: 403 }
      );
    }
    
    // Compare passwords
    try {
      console.log('Admin direct login: Comparing passwords...');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Admin direct login: Password valid?', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('Admin direct login: Invalid password');
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    } catch (passwordError) {
      console.error('Admin direct login: Password comparison error:', passwordError);
      return NextResponse.json(
        { success: false, error: 'Authentication error' },
        { status: 500 }
      );
    }
    
    // Password is valid, generate and send OTP
    console.log('Admin direct login: Password valid, generating OTP...');
    const otp = generateOTP();
    
    // Save OTP to database
    try {
      await AdminOTP.findOneAndUpdate(
        { email: email.toLowerCase() },
        { 
          email: email.toLowerCase(),
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
        },
        { upsert: true, new: true }
      );
      console.log('Admin direct login: OTP saved to database');
    } catch (otpSaveError) {
      console.error('Admin direct login: Error saving OTP to database:', otpSaveError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate OTP. Please try again.' },
        { status: 500 }
      );
    }
    
    // Send OTP to admin email
    console.log('Admin direct login: Sending OTP email...');
    const emailSent = await sendAdminOTP(email, otp);
    
    if (!emailSent) {
      console.error('Admin direct login: Failed to send OTP email');
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP. Please check email configuration.' },
        { status: 500 }
      );
    }
    
    console.log('Admin direct login: OTP sent successfully');
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email address'
    });
    
  } catch (error) {
    console.error('Admin direct login: Error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 