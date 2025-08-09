import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationSMS } from '@/app/lib/sms-utils';

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
    const { phone, customerName, orderId } = body;
    
    // Validate input
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    // Generate test data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://avitoluxury.in';
    const invoiceLink = `${baseUrl}/invoice/${orderId || '123456'}`;
    const trackingId = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const totalAmount = 1999;
    
    // Send test SMS
    const result = await sendOrderConfirmationSMS({
      phone,
      customerName: customerName || 'Customer',
      trackingId,
      transactionId,
      totalAmount,
      invoiceLink
    });
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Test SMS sent successfully',
        details: {
          phone,
          customerName: customerName || 'Customer',
          invoiceLink,
          trackingId,
          transactionId
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send SMS' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in test-delivery-sms API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
} 