import { NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import AdminOTP from '@/app/models/AdminOTP';
import { generateOTP } from '@/app/lib/email-utils';

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

    // Connect to database
    await connectMongoDB();
    
    // Check if email belongs to an admin in the database
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role: 'admin' 
    });
    
    // For security, always return a generic success message even if the email doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log(`Password reset attempted for non-admin email: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a password reset OTP has been sent'
      });
    }
    
    // Generate a new OTP
    const otp = generateOTP();
    
    // Save OTP to database (create new or update existing)
    await AdminOTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        email: email.toLowerCase(),
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
      },
      { upsert: true, new: true }
    );
    
    // Send OTP to admin email using the custom template
    const transporter = require('nodemailer').createTransport({
      host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER || 'info@avitoluxury.in',
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: `Avito Luxury <${process.env.EMAIL_USER || 'info@avitoluxury.in'}>`,
      to: email,
      subject: 'Admin Password Reset OTP',
      html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Admin Password Reset OTP</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f4;
        padding: 0;
        margin: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #ffffff;
        text-align: center;
        padding: 30px 20px;
        border-bottom: 1px solid #ddd;
      }
      .header img {
        width: 120px;
        margin-bottom: 10px;
      }
      .header h2 {
        margin: 0;
        color: #000000;
      }
      .content {
        padding: 30px 20px;
        color: #333333;
      }
      .otp {
        font-size: 32px;
        font-weight: bold;
        text-align: center;
        letter-spacing: 5px;
        background-color: #f1f1f1;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .footer {
        background-color: #fafafa;
        padding: 15px 20px;
        font-size: 12px;
        text-align: center;
        color: #777777;
        border-top: 1px solid #eee;
      }
      @media (max-width: 600px) {
        .content, .footer, .header {
          padding: 20px 15px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://res.cloudinary.com/dzzxpyqif/image/upload/v1752956166/avito3-16_fst8wm.png" alt="Avito Luxury Logo" />
        <h2>Admin Password Reset</h2>
      </div>
      <div class="content">
        <p>Dear Admin,</p>
        <p>You have requested to reset your password. Please use the OTP below to proceed:</p>
        
        <div class="otp">${otp}</div>

        <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>

        <p>If you did not request this password reset, please ignore this email or contact support.</p>

        <p>Regards,<br>Avito Luxury Team</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} <a href="https://avitoluxury.in" style="color:#777;text-decoration:none;">AvitoLuxury.in</a> | All rights reserved.
      </div>
    </div>
  </body>
</html>`
    };

    await transporter.sendMail(mailOptions);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'If the email exists, a password reset OTP has been sent'
    });
    
  } catch (error) {
    console.error('Error in password reset:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 