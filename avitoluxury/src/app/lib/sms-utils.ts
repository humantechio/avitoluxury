import { Twilio } from 'twilio';
import axios from 'axios';
import qs from 'querystring';

// Create a Twilio client instance
const createTwilioClient = () => {
  // Get Twilio credentials from environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local');
    return null;
  }
  
  return new Twilio(accountSid, authToken);
};

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Format phone number to E.164 format for Twilio
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Add country code if needed (assuming India +91 prefix)
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  // If already has country code
  if (digits.length > 10) {
    return `+${digits}`;
  }
  
  // Return as is if format is unclear
  return phoneNumber;
};

// Send OTP to admin phone via Twilio Verify
export const sendAdminSMS = async (phoneNumber: string): Promise<boolean> => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      console.error('Failed to create Twilio client');
      return false;
    }
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    
    if (!verifyServiceSid) {
      console.error('Twilio Verify Service SID not configured');
      return false;
    }
    
    // Start the verification process using Twilio Verify
    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({
        to: formattedPhone,
        channel: 'sms'
      });
    
    console.log('Verification initiated with SID:', verification.sid);
    return true;
  } catch (error) {
    console.error('Error sending verification SMS:', error);
    return false;
  }
};

// Verify OTP code using Twilio Verify
export const verifyAdminSMS = async (phoneNumber: string, otp: string): Promise<boolean> => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      console.error('Failed to create Twilio client');
      return false;
    }
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    
    if (!verifyServiceSid) {
      console.error('Twilio Verify Service SID not configured');
      return false;
    }
    
    // Check the verification code
    const verificationCheck = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks
      .create({
        to: formattedPhone,
        code: otp
      });
    
    console.log('Verification check status:', verificationCheck.status);
    return verificationCheck.status === 'approved';
  } catch (error) {
    console.error('Error verifying SMS code:', error);
    return false;
  }
}; 

// 2Factor.in SMS sending utility
export const send2FactorSMS = async (
  phone: string,
  message: string,
  orderData?: {
    transactionId: string;
    amount: number;
    trackingId: string;
    trackingLink: string;
  }
): Promise<boolean> => {
  try {
    const apiKey = process.env.TWO_FACTOR_API_KEY || "d4b37114-5f02-11f0-a562-0200cd936042";
    const sender = process.env.TWO_FACTOR_SENDER_ID || 'AVTLUX';
    const templateName = process.env.TWO_FACTOR_TEMPLATE_NAME || 'AvitoLuxury';
    
    // Format phone number (remove country code if present)
    const formattedPhone = phone.startsWith('+91') ? phone.substring(3) : phone;
    
    console.log('Sending SMS to:', formattedPhone);
    console.log('Using sender ID:', sender);
    console.log('Using template name:', templateName);
    
    // Use the registered template with the correct variables
    try {
      // Prepare the data for the template
      const formData = new URLSearchParams();
      formData.append('module', 'TRANS_SMS');
      formData.append('apikey', apiKey);
      formData.append('to', formattedPhone);
      formData.append('from', sender);
      formData.append('templatename', templateName);
      
      // If order data is provided, use it for variables
      if (orderData) {
        formData.append('var1', orderData.transactionId);
        formData.append('var2', orderData.amount.toString());
        formData.append('var3', orderData.trackingId);
        formData.append('var4', orderData.trackingLink);
      } else {
        // Use placeholder values for testing
        formData.append('var1', 'TX123456');
        formData.append('var2', '1999');
        formData.append('var3', 'TRK789012');
        formData.append('var4', 'https://avitoluxury.in/track');
      }
      
      console.log('Sending with template variables:', Object.fromEntries(formData));
      
      // Make the API call
      const response = await fetch('https://2factor.in/API/R1/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      const data = await response.json();
      console.log('Template SMS response:', data);
      
      if (data && data.Status === 'Success') {
        console.log('SMS sent successfully with template');
        return true;
      } else {
        console.error('Failed to send SMS with template:', data);
        return false;
      }
    } catch (err: any) {
      console.error('Template SMS approach failed:', err.message);
      return false;
    }
  } catch (error: any) {
    console.error('Error in send2FactorSMS:', error.message);
    return false;
  }
};

// Send order confirmation SMS
export const sendOrderConfirmationSMS = async (
  orderData: {
    phone: string;
    customerName?: string;
    trackingId: string;
    transactionId: string;
    totalAmount: number;
    trackingLink?: string;
    invoiceLink?: string;
  }
): Promise<boolean> => {
  try {
    const { phone, trackingId, transactionId, totalAmount } = orderData;
    
    // Create a tracking link if not provided
    const trackingLink = orderData.trackingLink || 
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://avitoluxury.in'}/order-tracking?tracking_id=${trackingId}`;
    
    // Get customer name or use default
    const customerName = orderData.customerName || 'Customer';
    
    // Create invoice link if provided
    const invoiceLink = orderData.invoiceLink || '';
    
    // Create message based on whether this is a delivery notification or payment confirmation
    let message = '';
    
    if (invoiceLink) {
      // This is a delivery notification
      message = `Hi ${customerName}, your order has been delivered!\nView your invoice: ${invoiceLink}\nThank you for shopping with AvitoLuxury!\nWe look forward to seeing you again.`;
    } else {
      // This is a payment confirmation (original behavior)
      message = `Thank you for your order with AVITO LUXURY! Payment of Rs.${totalAmount} confirmed. TxnID: ${transactionId}. TrackingID: ${trackingId}.`;
    }
    
    // Use 2Factor.in API to send SMS
    const apiKey = process.env.TWO_FACTOR_API_KEY || "d4b37114-5f02-11f0-a562-0200cd936042";
    const sender = process.env.TWO_FACTOR_SENDER_ID || 'AVTLUX';
    
    // Format phone number (remove country code if present)
    const formattedPhone = phone.startsWith('+91') ? phone.substring(3) : phone;
    
    console.log('Sending SMS to:', formattedPhone);
    console.log('Message:', message);
    
    // Prepare the data for direct message sending
    const formData = new URLSearchParams();
    formData.append('module', 'TRANS_SMS');
    formData.append('apikey', apiKey);
    formData.append('to', formattedPhone);
    formData.append('from', sender);
    formData.append('msg', message);
    
    // Make the API call
    const response = await fetch('https://2factor.in/API/R1/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    const data = await response.json();
    console.log('SMS API response:', data);
    
    if (data && data.Status === 'Success') {
      console.log('SMS sent successfully');
      return true;
    } else {
      console.error('Failed to send SMS:', data);
      return false;
    }
  } catch (error) {
    console.error('Error sending order confirmation SMS:', error);
    return false;
  }
}; 