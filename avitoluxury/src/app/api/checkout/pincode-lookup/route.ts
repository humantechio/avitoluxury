import { NextRequest, NextResponse } from 'next/server';

// Fallback database for common pincodes in case the API fails
const fallbackPincodes: Record<string, { city: string; state: string }> = {
  // Maharashtra
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '400050': { city: 'Mumbai', state: 'Maharashtra' },
  '411001': { city: 'Pune', state: 'Maharashtra' },
  
  // Delhi
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '110020': { city: 'New Delhi', state: 'Delhi' },
  '110092': { city: 'Delhi', state: 'Delhi' },
  
  // Karnataka
  '560001': { city: 'Bengaluru', state: 'Karnataka' },
  '560002': { city: 'Bengaluru', state: 'Karnataka' },
  '560040': { city: 'Bengaluru', state: 'Karnataka' },
  
  // Tamil Nadu
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '600002': { city: 'Chennai', state: 'Tamil Nadu' },
  
  // Gujarat
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '380006': { city: 'Ahmedabad', state: 'Gujarat' },
  
  // Telangana
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  '500032': { city: 'Hyderabad', state: 'Telangana' },
  
  // West Bengal
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  '700019': { city: 'Kolkata', state: 'West Bengal' },
  
  // Test pincode from the screenshot
  '282006': { city: 'Agra', state: 'Uttar Pradesh' }
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pincode = url.searchParams.get('pincode');
    
    console.log('Pincode lookup API called with pincode:', pincode);
    
    if (!pincode) {
      console.log('Pincode missing in request');
      return NextResponse.json(
        { success: false, error: 'Pincode is required' },
        { status: 400 }
      );
    }
    
    // Call RapidAPI for pincode lookup
    console.log('Calling RapidAPI with pincode:', pincode);
    try {
      const rapidApiResponse = await fetch(`https://india-pincode-with-latitude-and-longitude.p.rapidapi.com/api/v1/pincode/${pincode}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'ba71473752msh7b13dc531279605p13884djsn2a75f01e559b',
          'X-RapidAPI-Host': 'india-pincode-with-latitude-and-longitude.p.rapidapi.com'
        }
      });
      
      if (!rapidApiResponse.ok) {
        console.log('RapidAPI returned error status:', rapidApiResponse.status);
        
        // Try fallback database
        if (fallbackPincodes[pincode]) {
          console.log('Using fallback database for pincode:', pincode);
          return NextResponse.json({
            success: true,
            data: fallbackPincodes[pincode],
            source: 'fallback'
          });
        }
        
        return NextResponse.json(
          { success: false, error: `API error: ${rapidApiResponse.status}` },
          { status: rapidApiResponse.status }
        );
      }
      
      const rapidApiData = await rapidApiResponse.json();
      console.log('RapidAPI response:', rapidApiData);
      
      if (!rapidApiData || !Array.isArray(rapidApiData) || rapidApiData.length === 0) {
        console.log('Pincode not found or invalid response format');
        
        // Try fallback database
        if (fallbackPincodes[pincode]) {
          console.log('Using fallback database for pincode:', pincode);
          return NextResponse.json({
            success: true,
            data: fallbackPincodes[pincode],
            source: 'fallback'
          });
        }
        
        return NextResponse.json(
          { success: false, error: 'Pincode not found' },
          { status: 404 }
        );
      }
      
      // Extract city and state from the API response
      const pincodeData = rapidApiData[0];
      console.log('Extracted pincode data:', pincodeData);
      
      if (!pincodeData.district || !pincodeData.state) {
        console.log('Missing district or state in API response');
        
        // Try fallback database
        if (fallbackPincodes[pincode]) {
          console.log('Using fallback database for pincode:', pincode);
          return NextResponse.json({
            success: true,
            data: fallbackPincodes[pincode],
            source: 'fallback'
          });
        }
        
        return NextResponse.json(
          { success: false, error: 'Incomplete data for this pincode' },
          { status: 422 }
        );
      }
      
      const responseData = {
        success: true,
        data: {
          city: pincodeData.district,
          state: pincodeData.state
        },
        source: 'api'
      };
      console.log('Sending response:', responseData);
      
      return NextResponse.json(responseData);
    } catch (apiError) {
      console.error('RapidAPI request failed:', apiError);
      
      // Try fallback database
      if (fallbackPincodes[pincode]) {
        console.log('Using fallback database for pincode:', pincode);
        return NextResponse.json({
          success: true,
          data: fallbackPincodes[pincode],
          source: 'fallback'
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to fetch pincode data from API' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Pincode lookup error:', error);
    
    // Try fallback database as last resort
    const pincode = new URL(request.url).searchParams.get('pincode');
    if (pincode && fallbackPincodes[pincode]) {
      console.log('Using fallback database as last resort for pincode:', pincode);
      return NextResponse.json({
        success: true,
        data: fallbackPincodes[pincode],
        source: 'fallback'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to look up pincode' },
      { status: 500 }
    );
  }
} 