import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the CSP report from the request body
    const report = await request.json();
    
    // In production, you might want to log this to a monitoring service
    // For now, we'll just log it to the console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('CSP Violation Report:');
      console.log(JSON.stringify(report, null, 2));
    }
    
    // Return a success response
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    // Silent error handling
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// Don't cache this route
export const dynamic = 'force-dynamic'; 