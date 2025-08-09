import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Only allow this route in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }

    const apiKey = process.env.TWO_FACTOR_API_KEY;
    const senderId = process.env.TWO_FACTOR_SENDER_ID || 'AVTLUX';
    
    return NextResponse.json({
      success: true,
      apiKeyPresent: !!apiKey,
      apiKeyFirstChars: apiKey ? apiKey.substring(0, 8) + '...' : 'Not set',
      senderId: senderId,
      nodeEnv: process.env.NODE_ENV,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'Not set'
    });
    
  } catch (error: any) {
    console.error('Error in SMS debug route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get SMS configuration' },
      { status: 500 }
    );
  }
} 