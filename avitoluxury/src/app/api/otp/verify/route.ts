import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import OTP from '@/app/models/OTP';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { phone, otp } = await request.json();
    
    // Validate inputs
    if (!phone || !otp) {
      return NextResponse.json({ 
        success: false, 
        error: 'Phone number and OTP are required' 
      }, { status: 400 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the OTP record
    const otpRecord = await OTP.findOne({ phone });
    
    // Check if OTP exists
    if (!otpRecord) {
      return NextResponse.json({ 
        success: false, 
        error: 'No OTP found for this phone number. Please request a new OTP.' 
      }, { status: 400 });
    }
    
    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid OTP. Please try again.' 
      }, { status: 400 });
    }
    
    // Check if OTP is expired (handled by MongoDB TTL index, but double-check)
    const now = new Date();
    const otpCreatedAt = new Date(otpRecord.createdAt);
    const diffMinutes = (now.getTime() - otpCreatedAt.getTime()) / (1000 * 60);
    
    if (diffMinutes > 10) {
      return NextResponse.json({ 
        success: false, 
        error: 'OTP has expired. Please request a new OTP.' 
      }, { status: 400 });
    }
    
    // Mark OTP as verified
    otpRecord.isVerified = true;
    await otpRecord.save();
    
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      verified: true
    });
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to verify OTP. Please try again.' 
    }, { status: 500 });
  }
} 