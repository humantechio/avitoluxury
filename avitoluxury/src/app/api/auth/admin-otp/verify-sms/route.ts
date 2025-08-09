import { NextResponse } from 'next/server';
import { encrypt } from '@/app/lib/server-auth';
import connectMongoDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import { Types } from 'mongoose';
import { formatPhoneNumber, verifyAdminSMS } from '@/app/lib/sms-utils';

export async function POST(request: Request) {
  try {
    // Get phone and OTP from request body
    const { phone, otp } = await request.json();
    
    // Validate input
    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone number and verification code are required' },
        { status: 400 }
      );
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);

    // Connect to database
    await connectMongoDB();
    
    // Verify the OTP with Twilio Verify
    const isValid = await verifyAdminSMS(formattedPhone, otp);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }
    
    // Find admin user
    let user = await User.findOne({ 
      phone: formattedPhone,
      role: 'admin' 
    });
    
    // If user not found by phone, try finding any admin and update their phone
    if (!user) {
      user = await User.findOne({ role: 'admin' });
      
      if (user) {
        user.phone = formattedPhone;
        await user.save();
        console.log(`Updated admin user with phone: ${formattedPhone}`);
      }
    }
    
    // Double-check user exists and is admin
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found or not an admin' },
        { status: 404 }
      );
    }
    
    // Create JWT token
    const userId = user._id instanceof Types.ObjectId 
      ? user._id.toString() 
      : String(user._id);
      
    const token = await encrypt({ 
      email: user.email,
      name: user.name,
      role: user.role,
      userId,
      phone: formattedPhone
    });
    
    // Return success with token and user data
    return NextResponse.json({ 
      success: true,
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        userId,
        phone: formattedPhone
      }
    });
    
  } catch (error) {
    console.error('Error verifying SMS code:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 