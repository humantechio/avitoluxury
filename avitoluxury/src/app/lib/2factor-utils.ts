import axios from 'axios';

// Generate a random 6-digit OTP (for fallback only)
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via 2factor SMS and return the session ID and OTP
export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; sessionId?: string; otp?: string }> {
  try {
    // Validate API key
    const apiKey = process.env.TWOFACTOR_API_KEY;
    if (!apiKey) {
      console.error('2Factor API key not configured. Please set TWOFACTOR_API_KEY in .env.local');
      return { success: false };
    }

    // Format the API URL correctly with the API key
    const apiUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${phoneNumber}/AUTOGEN/OTP1`;

    console.log('Sending OTP via 2factor to:', phoneNumber);

    // Send the request to 2factor API
    const response = await axios.get(apiUrl);

    console.log('2factor API response:', JSON.stringify(response.data));

    // Check if the request was successful
    if (response.data && response.data.Status === 'Success') {
      // For development purposes, extract OTP from Details if available (some test accounts show this)
      let otp = undefined;
      
      // Some test accounts might return the OTP in the Details field
      if (response.data.Details && typeof response.data.Details === 'string' && response.data.Details.includes('OTP is')) {
        const match = response.data.Details.match(/OTP is (\d+)/);
        if (match && match[1]) {
          otp = match[1];
          console.log('Extracted OTP from response:', otp);
        }
      }
      
      return { 
        success: true, 
        sessionId: response.data.Details, 
        otp // This might be undefined for production accounts
      };
    } else {
      console.error('Error sending OTP via 2factor:', response.data);
      return { success: false };
    }
  } catch (error) {
    console.error('Error sending OTP via 2factor:', error);
    return { success: false };
  }
} 