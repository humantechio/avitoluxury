import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Twilio SMS
export const sendOTP = async (phoneNumber: string, otp: string): Promise<boolean> => {
  try {
    // Ensure phone number is in correct format (with country code)
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    
    // Initialize Twilio client
    const client = twilio(accountSid, authToken);
    
    // Send SMS
    await client.messages.create({
      body: `Your A V I T O   S C E N T S verification code is: ${otp}. Valid for 10 minutes.`,
      from: twilioPhoneNumber,
      to: formattedPhoneNumber
    });
    
    return true;
  } catch (error) {
    console.error('Error sending OTP via Twilio:', error);
    return false;
  }
};

// Format phone number to include country code if needed
const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // If the phone number doesn't start with +, add Indian country code
  if (!digitsOnly.startsWith('91') && digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  
  // If it already has country code but no +, add it
  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    return `+${digitsOnly}`;
  }
  
  // If it already has + prefix, return as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // Default case - add + prefix
  return `+${digitsOnly}`;
}; 