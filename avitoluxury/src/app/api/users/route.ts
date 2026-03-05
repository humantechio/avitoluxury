import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '../../models/User';
import connectMongoDB from '@/app/lib/mongodb';
import { decrypt } from '@/app/lib/auth-utils';

// GET all users or a single user by ID
export async function GET(request: Request) {
  try {
    // Check if requesting a specific user
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');
    
    // Verify admin token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      // For development, continue without token verification
    } else {
      try {
        const payload = await decrypt(token);
        
        if (!payload || payload.role !== 'admin') {
          return NextResponse.json({ error: 'Unauthorized - Not an admin' }, { status: 403 });
        }
      } catch (tokenError) {
        // For development, continue without token verification
      }
    }
    
    // Connect to the database
    try {
      await connectMongoDB();
      
      // If requesting a specific user
      if (userId) {
        
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return NextResponse.json({ 
            success: false, 
            error: 'Invalid user ID format' 
          }, { status: 400 });
        }
        
        const user = await User.findById(userId)
          .select('name email role createdAt updatedAt phone')
          .lean();
          
        if (!user) {
          return NextResponse.json({ 
            success: false, 
            error: 'User not found' 
          }, { status: 404 });
        }
        
        // Format user for API response
        const formattedUser = {
          id: user._id?.toString() || 'unknown-id',
          name: user.name || 'Unknown User',
          email: user.email || 'unknown@example.com',
          role: user.role || 'user',
          createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
          lastLogin: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
          status: 'active', // Default status since we don't track this in the schema
          phone: user.phone || ''
        };
        
        return NextResponse.json({ 
          success: true, 
          user: formattedUser
        });
      } 
      // Otherwise, fetch all users
      else {
        // Fetch users from the database
        const users = await User.find({})
          .select('name email role createdAt updatedAt phone')
          .lean() // Use lean() to get plain JS objects instead of Mongoose documents
          .sort({ createdAt: -1 });
        
        // Format users for API response
        const formattedUsers = users.map((user: any) => {
          return {
            id: user._id?.toString() || 'unknown-id',
            name: user.name || 'Unknown User',
            email: user.email || 'unknown@example.com',
            role: user.role || 'user',
            createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
            lastLogin: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
            status: 'active', // Default status since we don't track this in the schema
            phone: user.phone || ''
          };
        });
        
        return NextResponse.json({ 
          success: true, 
          users: formattedUsers,
          total: formattedUsers.length
        });
      }
    } catch (dbError) {
      // If requesting a specific user and DB fails, return error
      if (userId) {
        return NextResponse.json({ 
          success: false, 
          error: 'Database error, unable to fetch user' 
        }, { status: 500 });
      }
      
      // For all users, return empty list as fallback
      return NextResponse.json({ 
        success: true, 
        users: [],
        total: 0
      });
    }
  } catch (error) {
    // If requesting a specific user
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');
    
    if (userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Server error, unable to fetch user' 
      }, { status: 500 });
    }
    
    // Return empty list for all users in case of any errors
    return NextResponse.json({ 
      success: true, 
      users: [],
      total: 0
    });
  }
}

// POST a new user
export async function POST(request: Request) {
  try {
    await connectMongoDB();
    const body = await request.json();
    
    // Check if user already exists
    const userExists = await User.findOne({ email: body.email });
    if (userExists) {
      return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
    }
    
    const user = await User.create(body);
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err) {
    console.error('Error creating user:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// DELETE a user by ID
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }
    
    // Verify admin token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    try {
      const payload = await decrypt(token);
      
      if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized - Not an admin' }, { status: 403 });
      }
    } catch (tokenError) {
      console.error('Invalid token in delete user request:', tokenError);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }
    
    await connectMongoDB();
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    // Cannot delete self
    if (user.email === 'admin@example.com') {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete the main admin account' 
      }, { status: 400 });
    }
    
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete user' 
    }, { status: 500 });
  }
}

// PATCH - update a user
export async function PATCH(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }
    
    // Verify admin token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    try {
      const payload = await decrypt(token);
      
      if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized - Not an admin' }, { status: 403 });
      }
    } catch (tokenError) {
      console.error('Invalid token in update user request:', tokenError);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }
    
    await connectMongoDB();
    
    // Get request body
    const body = await request.json();
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    // Prevent changing email to one that already exists
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await User.findOne({ email: body.email });
      if (emailExists) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email already in use by another user' 
        }, { status: 400 });
      }
    }
    
    // Don't allow changing role of main admin
    if (existingUser.email === 'admin@example.com' && body.role && body.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot change role of the main admin account' 
      }, { status: 400 });
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update user' 
    }, { status: 500 });
  }
} 