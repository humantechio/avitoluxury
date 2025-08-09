'use server';

import { connectToDatabase } from './db-connect';
import User, { IUser } from '../models/User';
import { decrypt } from './server-auth';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-key-change-in-production';

// Define a type for the user data we return
interface UserData {
  userId: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Server action to verify a user token and get user data
 */
export async function verifyUserTokenAction(token: string): Promise<UserData | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Connect to database
    await connectToDatabase();
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password').lean();
    
    if (!user) {
      return null;
    }
    
    return {
      userId: user._id instanceof Types.ObjectId ? user._id.toString() : String(user._id),
      name: String(user.name),
      email: String(user.email),
      role: String(user.role)
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Server action to get user by ID
 */
export async function getUserById(userId: string): Promise<UserData | null> {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Find user by ID
    const user = await User.findById(userId).select('-password').lean();
    
    if (!user) {
      return null;
    }
    
    return {
      userId: user._id instanceof Types.ObjectId ? user._id.toString() : String(user._id),
      name: String(user.name),
      email: String(user.email),
      role: String(user.role)
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
} 