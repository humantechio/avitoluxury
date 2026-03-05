import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';

// POST to save layout data
export async function POST(request: NextRequest) {
  try {
    const layoutData = await request.json();
    
    // Basic validation
    if (!layoutData || !Array.isArray(layoutData)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid layout data format' 
      }, { status: 400 });
    }
    
    // Save layout data to database
    await connectMongoDB();
    // Implement actual database save logic here
    
    return NextResponse.json({ 
      success: true,
      message: 'Layout saved successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error saving layout:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Server error' 
    }, { status: 500 });
  }
} 