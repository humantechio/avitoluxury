import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import OTP from '@/app/models/OTP';
import { sendOTP } from '@/app/lib/2factor-utils';

// Maximum OTP requests per 24 hours
const MAX_OTP_REQUESTS = 4;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;
    
    // Validate phone number
    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if user has exceeded the maximum number of OTP requests in 24 hours
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    const otpRequests = await OTP.countDocuments({
      phone,
      createdAt: { $gte: last24Hours }
    });
    
    if (otpRequests >= MAX_OTP_REQUESTS) {
      return NextResponse.json(
        { success: false, error: 'Maximum OTP requests exceeded. Please try again after 24 hours.' },
        { status: 429 }
      );
    }
    
    // Check if there's an active OTP that's not expired yet
    const activeOTP = await OTP.findOne({
      phone,
      expiresAt: { $gt: new Date() }
    });
    
    if (activeOTP) {
      // Calculate remaining time in minutes
      const remainingTime = Math.ceil((activeOTP.expiresAt.getTime() - Date.now()) / (1000 * 60));
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Please wait ${remainingTime} minute${remainingTime > 1 ? 's' : ''} before requesting a new OTP.` 
        },
        { status: 429 }
      );
    }
    
    // Check if 2Factor API key is configured
    const apiKey = process.env.TWOFACTOR_API_KEY;
    
    if (!apiKey) {
      console.error('2Factor API key not configured');
      return NextResponse.json(
        { success: false, error: 'SMS service not configured' },
        { status: 500 }
      );
    }
    
    // Send OTP via 2Factor
    const result = await sendOTP(phone);
    
    if (!result.success || !result.sessionId) {
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP. Please try again later.' },
        { status: 500 }
      );
    }
    
    // Store session ID in database after successful sending
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP expires in 5 minutes
    
    // Check again to make sure we haven't exceeded the limit (in case of concurrent requests)
    const currentOtpCount = await OTP.countDocuments({
      phone,
      createdAt: { $gte: last24Hours }
    });
    
    if (currentOtpCount >= MAX_OTP_REQUESTS) {
      return NextResponse.json(
        { success: false, error: 'Maximum OTP requests exceeded. Please try again after 24 hours.' },
        { status: 429 }
      );
    }
    
    await OTP.findOneAndUpdate(
      { phone },
      { 
        phone,
        sessionId: result.sessionId,
        otp: result.otp || '', // Store OTP if available (for development)
        expiresAt,
        verified: false,
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    // For development, log the OTP if it was extracted
    if (result.otp) {
      console.log(`[DEV] OTP for ${phone}: ${result.otp}`);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
} 