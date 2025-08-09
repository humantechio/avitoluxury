import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/app/lib/mongodb';
import Contact from '@/app/models/Contact';

interface Params {
  params: {
    id: string;
  };
}

// GET request handler to fetch a single contact by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    // Connect to the database
    await connectMongoDB();
    
    // Get contact by ID
    const contact = await Contact.findById(id);
    
    if (!contact) {
      return NextResponse.json(
        { success: false, message: 'Contact not found' },
        { status: 404 }
      );
    }
    
    // Return success response
    return NextResponse.json(
      { success: true, data: contact },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error fetching contact:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch contact',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// PATCH request handler to update a contact's status
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    // Ensure params is awaited before accessing properties
    const id = params.id;
    
    // Connect to the database
    await connectMongoDB();
    
    // Parse the request body
    const body = await request.json();
    
    // Extract status from the request body
    const { status } = body;
    
    // Validate status value
    if (!status || !['pending', 'read', 'responded', 'resolved'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Find and update the contact
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!updatedContact) {
      return NextResponse.json(
        { success: false, message: 'Contact not found' },
        { status: 404 }
      );
    }
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact status updated successfully',
        data: updatedContact 
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error updating contact status:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update contact status',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE request handler to delete a contact
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // Ensure params is awaited before accessing properties
    const id = params.id;
    
    // Connect to the database
    await connectMongoDB();
    
    // Find and delete the contact
    const deletedContact = await Contact.findByIdAndDelete(id);
    
    if (!deletedContact) {
      return NextResponse.json(
        { success: false, message: 'Contact not found' },
        { status: 404 }
      );
    }
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact deleted successfully'
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error deleting contact:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete contact',
        error: error.message 
      },
      { status: 500 }
    );
  }
} 