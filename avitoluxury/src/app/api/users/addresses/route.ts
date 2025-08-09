import mongoose, { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '../../../lib/auth-exports';
import { getSession } from '../../../lib/server-auth-exports';
import User from '../../../models/User';
import connectMongoDB from '../../../lib/mongodb';

interface Address {
  addressId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

// Get all addresses for the current user
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to database
    await connectMongoDB();
    
    // Find user
    const user = await User.findById(session.userId);
    
    if (!user) {
      console.error(`User not found with ID: ${session.userId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return addresses
    return NextResponse.json({ 
      success: true, 
      addresses: user.addresses || [] 
    });
  } catch (error: any) {
    console.error('Error retrieving addresses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve addresses' }, 
      { status: 500 }
    );
  }
}

// Add a new address
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await req.json();
    
    // Connect to database
    await connectMongoDB();
    
    // Find user
    const user = await User.findById(session.userId);
    
    if (!user) {
      console.error(`User not found with ID: ${session.userId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get current addresses or initialize empty array
    const addresses = user.addresses || [];
    
    // Generate unique address ID
    const { default: mongoose } = await import('mongoose');
    const addressId = new mongoose.Types.ObjectId().toString();
    
    // Prepare new address with ID
    const newAddress = {
      ...body,
      addressId,
      isDefault: body.isDefault || addresses.length === 0 // Make default if first address
    };
    
    // If this address is default, update all others to not be default
    if (newAddress.isDefault && addresses.length > 0) {
      addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }
    
    // Add new address
    addresses.push(newAddress);
    
    // Update user
    user.addresses = addresses;
    await user.save();
    
    return NextResponse.json({ 
      success: true, 
      addresses,
      newAddress
    });
  } catch (error: any) {
    console.error('Error saving address:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save address' }, 
      { status: 500 }
    );
  }
}

// Update an address
export async function PUT(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await req.json();
    const { addressId, isDefault, ...addressData } = body;
    
    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }
    
    // Connect to database
    await connectMongoDB();
    
    // Find user
    const user = await User.findById(session.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find address index
    const addresses = user.addresses || [];
    const addressIndex = addresses.findIndex((addr: any) => addr.addressId === addressId);
    
    if (addressIndex === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    // Update address
    addresses[addressIndex] = {
      ...addresses[addressIndex],
      ...addressData,
      addressId
    };
    
    // Handle default address logic
    if (isDefault) {
      addresses.forEach((addr: any, index: number) => {
        if (index !== addressIndex) {
          addr.isDefault = false;
        } else {
          addr.isDefault = true;
        }
      });
    }
    
    // Save changes
    user.addresses = addresses;
    await user.save();
    
    return NextResponse.json({ 
      success: true, 
      addresses: user.addresses 
    });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update address' }, 
      { status: 500 }
    );
  }
}

// Delete an address
export async function DELETE(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get address ID from URL params
    const url = new URL(req.url);
    const addressId = url.searchParams.get('addressId');
    
    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }
    
    // Connect to database
    await connectMongoDB();
    
    // Find user
    const user = await User.findById(session.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Filter out the address to delete
    const addresses = user.addresses || [];
    const updatedAddresses = addresses.filter((addr: any) => addr.addressId !== addressId);
    
    if (addresses.length === updatedAddresses.length) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    // Update default address if needed
    if (updatedAddresses.length > 0 && !updatedAddresses.some((addr: any) => addr.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }
    
    // Save changes
    user.addresses = updatedAddresses;
    await user.save();
    
    return NextResponse.json({ 
      success: true, 
      addresses: updatedAddresses 
    });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete address' }, 
      { status: 500 }
    );
  }
}