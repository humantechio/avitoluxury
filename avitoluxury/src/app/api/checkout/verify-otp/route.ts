import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import OTP from '@/app/models/OTP';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;
    
    // Validate input
    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find OTP record
    const otpRecord = await OTP.findOne({ 
      phone,
      expiresAt: { $gt: new Date() } 
    });
    
    if (!otpRecord || !otpRecord.sessionId) {
      return NextResponse.json(
        { success: false, error: 'No active OTP found for this number. Please request a new one.' },
        { status: 400 }
      );
    }
    
    // Validate API key
    const apiKey = process.env.TWOFACTOR_API_KEY;
    if (!apiKey) {
      console.error('2Factor API key not configured');
      return NextResponse.json(
        { success: false, error: 'SMS service not configured' },
        { status: 500 }
      );
    }
    
    try {
      // Verify OTP with 2Factor API
      const verifyUrl = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${otpRecord.sessionId}/${otp}`;
      console.log('Verifying OTP with URL:', verifyUrl);
      
      const response = await axios.get(verifyUrl);
      console.log('2Factor verification response:', JSON.stringify(response.data));
      
      if (response.data && response.data.Status === 'Success') {
        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();
        
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid OTP. Please try again.' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error verifying OTP with 2Factor:', error);
      
      // For development, if we have the OTP stored, verify it directly
      if (process.env.NODE_ENV === 'development' && otpRecord.otp && otpRecord.otp === otp) {
        console.log('[DEV] Verifying OTP locally');
        otpRecord.verified = true;
        await otpRecord.save();
        return NextResponse.json({ success: true });
      }
      
      return NextResponse.json(
        { success: false, error: 'Invalid OTP or verification failed. Please try again.' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
} 