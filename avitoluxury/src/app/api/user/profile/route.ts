import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import mongoose from 'mongoose';
import { setApiCookies } from '../../auth/cookies-util';

// Helper function to extract user ID from cookies
export async function getUserIdFromCookies(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const userDataCookieMatch = cookie.match(/userData=([^;]+)/);
    
    if (!userDataCookieMatch) {
      return null;
    }
    
    // Properly decode the cookie value
    const encodedUserData = userDataCookieMatch[1];
    const decodedUserData = decodeURIComponent(encodedUserData);
    const userData = JSON.parse(decodedUserData);
    
    return userData.userId;
  } catch (err) {
    console.error('Error parsing user data from cookie:', err);
    return null;
  }
}

// GET - Fetch user profile
export async function GET(request: Request) {
  try {
    // Get user ID from cookies
    const userId = await getUserIdFromCookies(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find the user
    const user = await User.findById(userId)
      .select('name email phone gender') // Only select needed fields
      .lean();
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Return user profile data
    return NextResponse.json({
      success: true,
      profile: {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || ''
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: Request) {
  try {
    // Get user ID from cookies
    const userId = await getUserIdFromCookies(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }
    
    // Parse request body
    const data = await request.json();
    const { name, phone, gender } = data;
    
    // Validate name (required field)
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        error: 'Name is required' 
      }, { status: 400 });
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Update user fields (except email)
    user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (gender !== undefined) user.gender = gender.trim();
    
    // Save updated user
    await user.save();
    
    // Create a token for the cookie update
    const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1] || '';
    
    // Create response
    const response = NextResponse.json({
      success: true,
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        gender: user.gender || ''
      }
    });
    
    // Update the userData cookie to reflect the name change
    // Prepare user object with current values for cookie update
    const userForCookie = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    setApiCookies(response, userForCookie, token);
    
    return response;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
} 