import { NextResponse } from 'next/server';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';
import connectMongoDB from '@/app/lib/mongodb';

export async function GET() {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    const adminEmail = 'chineshsoni2@gmail.com';
    const adminPassword = 'chinesh@123';
    
    // Check if admin user already exists
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      // Update admin password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      adminUser.password = hashedPassword;
      adminUser.role = 'admin'; // Ensure role is admin
      await adminUser.save();
      
      return NextResponse.json({
        success: true,
        message: 'Admin user updated successfully',
        email: adminEmail
      });
    } else {
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      const newAdmin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      
      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully',
        email: adminEmail
      });
    }
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create/update admin user' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 