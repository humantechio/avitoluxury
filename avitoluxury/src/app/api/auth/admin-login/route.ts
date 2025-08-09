import { NextResponse } from 'next/server';
import { encrypt } from '@/app/lib/server-auth';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';
import connectMongoDB from '@/app/lib/mongodb';
import { Types } from 'mongoose';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB using the centralized connection
    console.log('Admin login: Connecting to MongoDB...');
    await connectMongoDB();
    console.log('Admin login: MongoDB connected');
    
    const { email, password } = await request.json();
    console.log('Admin login attempt for email:', email);
    
    if (!email || !password) {
      console.log('Admin login: Missing email or password');
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find the user in the database
    console.log('Admin login: Finding user in database...');
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('Admin login: User found?', !!user);
    
    if (!user) {
      console.log('Admin login: User not found');
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check if the user is an admin
    console.log('Admin login: User role:', user.role);
    if (user.role !== 'admin') {
      console.log('Admin login: User is not an admin');
      return NextResponse.json(
        { success: false, error: 'You do not have admin privileges' },
        { status: 403 }
      );
    }
    
    // Compare passwords
    try {
      console.log('Admin login: Comparing passwords...');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Admin login: Password valid?', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('Admin login: Invalid password');
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    } catch (passwordError) {
      console.error('Admin login: Password comparison error:', passwordError);
      return NextResponse.json(
        { success: false, error: 'Authentication error' },
        { status: 500 }
      );
    }
    
    // Create JWT token with proper TypeScript typing for the user._id
    console.log('Admin login: Creating JWT token...');
    const userId = user._id instanceof Types.ObjectId 
      ? user._id.toString() 
      : String(user._id);
      
    const token = await encrypt({ 
      email: user.email,
      name: user.name,
      role: user.role,
      userId
    });
    
    console.log('Admin login: Login successful');
    
    // Return the token in the response
    return NextResponse.json({ 
      success: true,
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        userId
      }
    });
    
  } catch (error) {
    console.error('Admin login: Error during login:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 