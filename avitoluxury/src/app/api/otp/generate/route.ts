import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import OTP from '@/app/models/OTP';
import { generateOTP, sendOTP } from '@/app/lib/twilio-utils';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { phone } = await request.json();
    
    // Validate phone number
    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please provide a valid 10-digit phone number' 
      }, { status: 400 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Generate a new OTP
    const otp = generateOTP();
    
    // Save OTP to database (overwrite any existing OTP for this phone number)
    await OTP.findOneAndUpdate(
      { phone },
      { phone, otp, isVerified: false },
      { upsert: true, new: true }
    );
    
    // Send OTP via SMS
    const smsSent = await sendOTP(phone, otp);
    
    if (!smsSent) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send OTP. Please try again.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully'
    });
    
  } catch (error) {
    console.error('Error generating OTP:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate OTP. Please try again.' 
    }, { status: 500 });
  }
} 