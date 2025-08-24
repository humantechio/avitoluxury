import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import OTP from '@/app/models/OTP';
import { verifyOTP } from '@/app/lib/2factor-utils';

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
    
    // Validate API key
    const apiKey = process.env.TWOFACTOR_API_KEY;
    if (!apiKey) {
      console.error('2Factor API key not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'SMS service not configured' 
      }, { status: 500 });
    }
    
    try {
      // Use the verifyOTP function from 2factor-utils
      const isVerified = await verifyOTP(otpRecord.sessionId, otp);
      console.log('OTP verification result:', isVerified);
      
      if (isVerified) {
        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid OTP. Please try again.' 
        }, { status: 400 });
      }
    } catch (error) {
      console.error('Error verifying OTP with 2Factor:', error);
      
      // For development, if we have the OTP stored, verify it directly
      if (process.env.NODE_ENV === 'development' && otpRecord.otp && otpRecord.otp === otp) {
        console.log('[DEV] Verifying OTP locally');
        otpRecord.verified = true;
        await otpRecord.save();
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid OTP or verification failed. Please try again.' 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      isVerified: true
    });
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to verify OTP. Please try again.' 
    }, { status: 500 });
  }
}