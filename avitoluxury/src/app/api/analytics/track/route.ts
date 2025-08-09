import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import mongoose from 'mongoose';

// Analytics schema if not already defined elsewhere
let Analytics;

if (mongoose.models.Analytics) {
  Analytics = mongoose.models.Analytics;
} else {
  const AnalyticsSchema = new mongoose.Schema(
    {
      userId: { type: String },
      sessionId: { type: String, required: true },
      eventType: { type: String, required: true },
      eventData: { type: mongoose.Schema.Types.Mixed, required: true },
      timestamp: { type: Date, default: Date.now },
      url: { type: String },
    },
    { timestamps: true }
  );

  Analytics = mongoose.model('Analytics', AnalyticsSchema);
}

// Helper function to extract user ID from cookies
const getUserIdFromCookies = (cookie: string) => {
  const userDataCookieMatch = cookie.match(/userData=([^;]+)/);
  if (!userDataCookieMatch) return null;
  
  try {
    const userData = JSON.parse(decodeURIComponent(userDataCookieMatch[1]));
    return userData.userId;
  } catch (err) {
    console.error('Error parsing user data from cookie:', err);
    return null;
  }
};

// POST endpoint to track analytics events
export async function POST(request: Request) {
  try {
    // Get user ID from cookies if available
    const cookie = request.headers.get('cookie') || '';
    const isLoggedIn = cookie.includes('isLoggedIn=true');
    const userId = isLoggedIn ? getUserIdFromCookies(cookie) : null;
    
    // Parse event data
    const eventData = await request.json();
    
    // Override userId if user is logged in
    if (userId) {
      eventData.userId = userId;
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Create analytics record
    const analytics = new Analytics({
      userId: eventData.userId || null,
      sessionId: eventData.sessionId,
      eventType: eventData.type,
      eventData,
      timestamp: new Date(eventData.timestamp),
      url: eventData.url || null,
    });
    
    // Save analytics record
    await analytics.save();
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Analytics event tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
} 