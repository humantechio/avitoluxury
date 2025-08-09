import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectMongoDB from '@/app/lib/mongodb';
import User from '@/app/models/User';

// Remove all console.log statements
// Replace them with a secure logging function if needed

// Example secure logging function
const secureLog = (message: string) => {
  if (process.env.NODE_ENV !== 'production') {
    // Only log in development
  }
};

// Then replace all console.log calls with secureLog or remove them completely

// GET endpoint to fetch user addresses
export async function GET(request: Request) {
  try {
    secureLog('GET /api/user/addresses - Fetching addresses');
    
    // Get session from cookies
    const cookie = request.headers.get('cookie') || '';
    secureLog('Cookie header present: ' + !!cookie);
    
    // Check for isLoggedIn cookie without assuming specific value
    const isLoggedInCookie = cookie.match(/isLoggedIn=([^;]+)/);
    secureLog('isLoggedIn cookie found: ' + !!isLoggedInCookie);
    
    if (!isLoggedInCookie) {
      secureLog('User not logged in, returning 401');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { 
        status: 401,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      });
    }
    
    // Find the userDataCookie to extract the user ID
    const userDataCookieMatch = cookie.match(/userData=([^;]+)/);
    secureLog('userData cookie match found: ' + !!userDataCookieMatch);
    
    if (!userDataCookieMatch) {
      secureLog('No userData cookie found, returning 401');
      return NextResponse.json({ 
        success: false, 
        error: 'User data not found in cookies' 
      }, { status: 401 });
    }
    
    try {
      // Properly decode the cookie value
      const encodedUserData = userDataCookieMatch[1];
      secureLog('Encoded userData: ' + encodedUserData);
      
      // Handle URL-encoded JSON properly
      const decodedUserData = decodeURIComponent(encodedUserData);
      secureLog('Decoded userData: ' + decodedUserData);
      
      const userData = JSON.parse(decodedUserData);
      secureLog('userData parsed successfully, userId: ' + userData.userId);
      
      const userId = userData.userId;
      
      if (!userId) {
        secureLog('No userId found in userData');
        return NextResponse.json({ 
          success: false, 
          error: 'User ID not found in cookie data' 
        }, { status: 400 });
      }
      
      // Connect to MongoDB
      secureLog('Connecting to MongoDB...');
      await connectMongoDB();
      secureLog('Connected to MongoDB');
      
      // Find the user and get their addresses
      secureLog('Finding user with ID: ' + userId);
      const user = await User.findById(userId);
      
      if (!user) {
        secureLog('User not found with ID: ' + userId);
        return NextResponse.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404 });
      }
      
      secureLog('User found, addresses count: ' + (user.addresses?.length || 0));
      return NextResponse.json({
        success: true,
        addresses: user.addresses || []
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      });
    } catch (err) {
      console.error('Error processing user data from cookie:', err);
      console.error('Error details:', err instanceof Error ? err.message : String(err));
      
      // Check if the error is a JSON parse error
      if (err instanceof SyntaxError) {
        console.error('JSON parse error with userData cookie');
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid user data format in cookie' 
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid user data in cookie' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  }
}

// Helper function to extract user ID from cookies
export async function getUserIdFromCookies(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const userDataCookieMatch = cookie.match(/userData=([^;]+)/);
    
    if (!userDataCookieMatch) {
      return null;
    }
    
    // Properly decode the cookie value
    const encodedUserData = userDataCookieMatch[1];
    const decodedUserData = decodeURIComponent(encodedUserData);
    const userData = JSON.parse(decodedUserData);
    
    return userData.userId;
  } catch (err) {
    console.error('Error parsing user data from cookie:', err);
    return null;
  }
}

// POST endpoint to add a new address
export async function POST(request: Request) {
  try {
    // Get user ID from cookies
    const userId = await getUserIdFromCookies(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }
      
      // Connect to MongoDB
      await connectMongoDB();
      
      // Parse request body
      const { fullName, phone, addressLine1, addressLine2, city, state, pincode, country = 'India', isDefault } = await request.json();
      
      // Validate required fields
      if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
        return NextResponse.json({ 
          success: false, 
          error: 'Missing required address fields' 
        }, { status: 400 });
      }
      
      // Find the user
      const user = await User.findById(userId);
      
      if (!user) {
        return NextResponse.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404 });
      }
      
      // Create new address
      const newAddress = {
        addressId: new mongoose.Types.ObjectId().toString(),
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country,
        isDefault: isDefault || false
      };
      
      // If this is set as default, remove default status from other addresses
      if (newAddress.isDefault && user.addresses) {
        user.addresses.forEach((address: any) => {
          address.isDefault = false;
        });
      }
      
      // Add the new address
      if (!user.addresses) {
        user.addresses = [newAddress];
      } else {
        user.addresses.push(newAddress);
      }
      
      // Save user
      await user.save();
      
      return NextResponse.json({
        success: true,
        address: newAddress
      });
  } catch (error) {
    console.error('Error adding address:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
}

// DELETE endpoint to remove an address
export async function DELETE(request: Request) {
  try {
    // Get user ID from cookies
    const userId = await getUserIdFromCookies(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }
    
    // Get the addressId from URL params
    const url = new URL(request.url);
    const addressId = url.searchParams.get('addressId');
    
    if (!addressId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Address ID is required' 
      }, { status: 400 });
    }
      
      // Connect to MongoDB
      await connectMongoDB();
      
      // Find the user
      const user = await User.findById(userId);
      
      if (!user) {
        return NextResponse.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404 });
      }
      
      // Check if user has addresses
      if (!user.addresses || user.addresses.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'No addresses found for this user' 
        }, { status: 404 });
      }
    
    // Check if the address exists
    const addressIndex = user.addresses.findIndex((addr: any) => addr.addressId === addressId);
    
    if (addressIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Address not found' 
      }, { status: 404 });
    }
    
    // Check if it's the default address
    const isDefault = user.addresses[addressIndex].isDefault;
    
    // Remove the address
    user.addresses.splice(addressIndex, 1);
    
    // If the deleted address was the default one and there are other addresses left,
    // set the first remaining address as default
    if (isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    
    // Save the user
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
}

// PUT endpoint to update an address
export async function PUT(request: Request) {
  try {
    // Get user ID from cookies
    const userId = await getUserIdFromCookies(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }
    
    // Parse request body
    const data = await request.json();
    const { addressId } = data;
    
    if (!addressId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Address ID is required' 
      }, { status: 400 });
    }
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
        }, { status: 404 });
      }
      
      // Initialize addresses array if it doesn't exist
      if (!user.addresses) {
        user.addresses = [];
        return NextResponse.json({ 
          success: false, 
          error: 'Address not found' 
        }, { status: 404 });
      }
      
      // Find the address to update
      const addressIndex = user.addresses.findIndex((addr: any) => addr.addressId === addressId);
      
      if (addressIndex === -1) {
        return NextResponse.json({ 
          success: false, 
          error: 'Address not found' 
        }, { status: 404 });
      }
    
    // Update the address
    const updatedAddress = {
      ...user.addresses[addressIndex],
      ...data
    };
      
    // If this address is being set as default, remove default status from other addresses
    if (data.isDefault && user.addresses) {
      user.addresses.forEach((address: any) => {
        address.isDefault = false;
      });
    }
      
    // Replace the old address with the updated one
    user.addresses[addressIndex] = updatedAddress;
      
    // Save user
    await user.save();
      
    return NextResponse.json({
      success: true,
      address: updatedAddress
    });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
} 

export const dynamic = 'force-dynamic'; 