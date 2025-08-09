import * as jose from 'jose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from './db-connect';
import User from '../models/User';

// Secret used for JWT signing
const getSecret = () => {
  const secretKey = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_only';
  
  return new TextEncoder().encode(secretKey);
};

// Token expiration time (24 hours)
export const expTime = '24h';
// Token expiration in milliseconds (24 hours)
export const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development_only';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback_admin_jwt_secret_for_development_only';

/**
 * Generate a JWT token containing user data
 */
export async function encrypt(payload: any) {
  try {
    const secret = getSecret();
    
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expTime)
      .sign(secret);
    
    return token;
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate token');
  }
}

/**
 * Verify and decode a JWT token
 */
export async function decrypt(token: string) {
  try {
    const secret = getSecret();
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify if a JWT token is valid and not expired
 */
export async function isValidToken(token: string) {
  try {
    const decoded = await decrypt(token);
    return !!decoded;
  } catch (error) {
    return false;
  }
}

/**
 * Get user details from a JWT token
 */
export async function getUserFromToken(token: string) {
  try {
    const decoded = await decrypt(token);
    if (!decoded) return null;
    
    return {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}

// Generate JWT token for users
export async function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Generate JWT token for admin
export async function generateAdminToken(payload: any) {
  return jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: '1d' });
}

// Verify user token
export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Connect to database
    await connectToDatabase();
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error) {
    return null;
  }
}

// Verify admin token
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    // First verify with jose
    const secret = getSecret();
    const { payload } = await jose.jwtVerify(token, secret);
    
    if (!payload || payload.role !== 'admin') {
      return false;
    }
    
    // Connect to database if needed for additional verification
    // This step could be added for extra security
    
    return true;
  } catch (error) {
    return false;
  }
}

// Hash password
export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare passwords
export async function comparePasswords(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
} 