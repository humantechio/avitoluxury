import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import Contact from '@/app/models/Contact';
import { sendContactFormEmail } from '@/app/lib/email-utils';

// POST request handler for form submissions
export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectMongoDB();
    
    // Parse the request body
    const body = await request.json();
    
    // Extract form data
    const { name, email, phone, subject, message } = body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Please fill all required fields' },
        { status: 400 }
      );
    }
    
    // Create a new contact submission
    const contactSubmission = await Contact.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      status: 'pending',
    });
    
    // Send email notification to admin
    try {
      await sendContactFormEmail({
        name,
        email,
        phone,
        subject,
        message
      });
      console.log('Contact form email notification sent successfully');
    } catch (emailError) {
      // Log the error but don't fail the request
      console.error('Failed to send contact form email notification:', emailError);
    }
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been sent successfully. We will get back to you soon.',
        data: contactSubmission 
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error submitting contact form:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit your message. Please try again later.',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// GET request handler to get all contact submissions (for admin use)
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectMongoDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');
    
    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Contact.countDocuments(query);
    
    // Get contact submissions with pagination
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: contacts,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error fetching contact submissions:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch contact submissions',
        error: error.message 
      },
      { status: 500 }
    );
  }
} 