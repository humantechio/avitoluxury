import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import AdminOTP from '@/app/models/AdminOTP';
import { generateOTP, sendAdminOTP } from '@/app/lib/email-utils';

export async function POST(request: Request) {
  try {
    // Get email from request body
    const { email } = await request.json();
    
    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if the email matches the configured admin email
    const adminEmail = 'chineshsoni2@gmail.com';
    
    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      // For security, we use a generic error message to avoid email enumeration
      return NextResponse.json(
        { success: false, error: 'If the email exists, an OTP has been sent to it' },
        { status: 200 } // Still return 200 to prevent enumeration attacks
      );
    }
    
    // Connect to database to verify admin status (double check)
    try {
      await connectMongoDB();
      
      // Check if email belongs to an admin in the database
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        role: 'admin' 
      });
      
      // If this is not an admin email in the database, still proceed but log it
      if (!user) {
        console.warn(`Warning: Email ${email} matches ADMIN_EMAIL but not found in database with admin role`);
        // We'll still send the OTP since the email matches the environment variable
      }
    } catch (dbError) {
      console.error('Database error while verifying admin:', dbError);
      // Continue anyway since we're using the environment variable as primary check
    }
    
    // Generate a new OTP
    const otp = generateOTP();
    
    // Save OTP to database (create new or update existing)
    try {
      await AdminOTP.findOneAndUpdate(
        { email: email.toLowerCase() },
        { 
          email: email.toLowerCase(),
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
        },
        { upsert: true, new: true }
      );
    } catch (otpSaveError) {
      console.error('Error saving OTP to database:', otpSaveError);
      // Continue anyway, we'll still try to send the email
    }
    
    // Send OTP to admin email
    const emailSent = await sendAdminOTP(email, otp);
    
    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP. Please check email configuration.' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email address'
    });
    
  } catch (error) {
    console.error('Error generating OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 