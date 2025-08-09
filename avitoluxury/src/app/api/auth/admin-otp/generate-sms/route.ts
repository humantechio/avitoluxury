import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import { sendAdminSMS, formatPhoneNumber } from '@/app/lib/sms-utils';

export async function POST(request: Request) {
  try {
    // Get phone from request body
    const { phone } = await request.json();
    
    // Validate phone
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Format the phone number
    const formattedPhone = formatPhoneNumber(phone);
    
    // Check if the phone matches the configured admin phone
    const adminPhone = process.env.ADMIN_PHONE || '8126518755';
    const formattedAdminPhone = formatPhoneNumber(adminPhone);
    
    if (formattedPhone !== formattedAdminPhone) {
      // For security, we use a generic error message to avoid enumeration
      return NextResponse.json(
        { success: false, error: 'If the phone exists, an OTP has been sent to it' },
        { status: 200 } // Still return 200 to prevent enumeration attacks
      );
    }
    
    // Connect to database to verify admin status (double check)
    try {
      await connectMongoDB();
      
      // Check if phone belongs to an admin in the database
      const user = await User.findOne({ 
        phone: formattedPhone,
        role: 'admin' 
      });
      
      // If this is not an admin phone in the database, update the user record
      if (!user) {
        console.warn(`Warning: Phone ${formattedPhone} matches ADMIN_PHONE but not found in database with admin role`);
        
        // Try to find the admin user and update with phone number
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
          adminUser.phone = formattedPhone;
          await adminUser.save();
          console.log(`Updated admin user with phone: ${formattedPhone}`);
        }
      }
    } catch (dbError) {
      console.error('Database error while verifying admin:', dbError);
      // Continue anyway since we're using the environment variable as primary check
    }
    
    // Use Twilio Verify to send the verification code
    const smsSent = await sendAdminSMS(formattedPhone);
    
    if (!smsSent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send verification code. Please check SMS configuration.' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your phone number'
    });
    
  } catch (error) {
    console.error('Error generating SMS verification:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 