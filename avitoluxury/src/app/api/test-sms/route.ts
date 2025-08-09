import { NextRequest, NextResponse } from 'next/server';
import { send2FactorSMS } from '@/app/lib/sms-utils';

export async function POST(request: NextRequest) {
  try {
    // Allow this route in development mode or when explicitly enabled
    if (process.env.NODE_ENV !== 'development' && 
        !process.env.ALLOW_SMS_TEST_IN_PRODUCTION && 
        !request.headers.get('x-allow-test')) {
      return NextResponse.json(
        { success: false, error: 'This endpoint is only available in development mode or when ALLOW_SMS_TEST_IN_PRODUCTION is set' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { phone, transactionId, amount, trackingId, trackingLink } = body;
    
    // Validate input
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    // Check if API key is configured
    const apiKey = process.env.TWO_FACTOR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'TWO_FACTOR_API_KEY is not configured in environment variables' },
        { status: 500 }
      );
    }
    
    // Format phone number (remove country code if present)
    const formattedPhone = phone.startsWith('+91') ? phone.substring(3) : phone;
    
    // Use the template with the correct variables
    try {
      const result = await send2FactorSMS(phone, "", {
        transactionId: transactionId || 'TX123456',
        amount: amount ? parseFloat(amount) : 1999,
        trackingId: trackingId || 'TRK789012',
        trackingLink: trackingLink || 'https://avitoluxury.in/track'
      });
      
      if (result) {
        return NextResponse.json({
          success: true,
          message: 'Test SMS sent successfully',
          phone: formattedPhone,
          template: 'AVITO LUXURY'
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to send SMS. Check server logs for details.' },
          { status: 500 }
        );
      }
    } catch (smsError: any) {
      console.error('Error sending test SMS:', smsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error sending SMS', 
          details: smsError.message || 'Unknown error'
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Error in test SMS route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 