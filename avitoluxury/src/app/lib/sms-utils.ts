// 2Factor.in SMS utility functions
// This file contains utilities for sending SMS via 2Factor.in API

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Format phone number for 2Factor.in API (remove +91 prefix if present)
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If it's a 10-digit number, use as is
  if (digits.length === 10) {
    return digits;
  }
  
  // If it has country code (like +91), remove it
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.substring(2);
  }
  
  // Return the digits as is
  return digits;
};

// Send OTP to admin phone via 2Factor.in
export const sendAdminSMS = async (phoneNumber: string): Promise<boolean> => {
  try {
    const apiKey = process.env.TWO_FACTOR_API_KEY || "d4b37114-5f02-11f0-a562-0200cd936042";
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Generate OTP
    const otp = generateOTP();
    
    // Prepare the data for OTP sending
    const formData = new URLSearchParams();
    formData.append('module', 'TRANS_SMS');
    formData.append('apikey', apiKey);
    formData.append('to', formattedPhone);
    formData.append('from', process.env.TWO_FACTOR_SENDER_ID || 'AVITOS');
    formData.append('templatename', 'OTPMessage'); // Use your OTP template name
    formData.append('var1', otp);
    
    // Make the API call
    const response = await fetch('https://2factor.in/API/V1/' + apiKey + '/SMS/' + formattedPhone + '/' + otp, {
      method: 'GET',
    });
    
    const data = await response.json();
    console.log('OTP SMS response:', data);
    
    if (data && data.Status === 'Success') {
      console.log('OTP sent successfully');
      return true;
    } else {
      console.error('Failed to send OTP:', data);
      return false;
    }
  } catch (error) {
    console.error('Error sending verification SMS:', error);
    return false;
  }
};

// Verify OTP code using 2Factor.in
export const verifyAdminSMS = async (phoneNumber: string, otp: string, sessionId: string): Promise<boolean> => {
  try {
    const apiKey = process.env.TWO_FACTOR_API_KEY || "d4b37114-5f02-11f0-a562-0200cd936042";
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Make the API call to verify OTP
    const response = await fetch('https://2factor.in/API/V1/' + apiKey + '/SMS/VERIFY/' + sessionId + '/' + otp, {
      method: 'GET',
    });
    
    const data = await response.json();
    console.log('OTP verification response:', data);
    
    if (data && data.Status === 'Success' && data.Details === 'OTP Matched') {
      console.log('OTP verified successfully');
      return true;
    } else {
      console.error('Failed to verify OTP:', data);
      return false;
    }
  } catch (error) {
    console.error('Error verifying SMS code:', error);
    return false;
  }
}; 

// 2Factor.in SMS sending utility with template
export const send2FactorSMS = async (
  phone: string,
  _message: string,
  orderData?: {
    transactionId: string;
    amount: number;
    trackingId: string;
    trackingLink: string;
  }
): Promise<boolean> => {
  try {
    const apiKey = process.env.TWO_FACTOR_API_KEY || "d4b37114-5f02-11f0-a562-0200cd936042";
    const sender = process.env.TWO_FACTOR_SENDER_ID || 'AVITOS';
    const templateName = process.env.TWO_FACTOR_TEMPLATE_NAME || 'Avito Orderrr';
    
    // Format phone number (remove country code if present)
    const formattedPhone = formatPhoneNumber(phone);
    
    console.log('Sending SMS to:', formattedPhone);
    console.log('Using sender ID:', sender);
    console.log('Using template name:', templateName);
    
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
    const response = await fetch('https://2factor.in/API/V1/' + apiKey + '/ADDON_SERVICES/SEND/TSMS', {
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
    const { phone, trackingId, totalAmount } = orderData;
    
    // Get customer name or use default
    const customerName = orderData.customerName || 'Customer';
    
    // Create invoice link if provided
    const invoiceLink = orderData.invoiceLink || '';
    
    // Create message based on whether this is a delivery notification or payment confirmation
    let message = '';
    
    if (invoiceLink) {
      // This is a delivery notification
      // This is a delivery notification
      message = `Hello, Your order has been delivered successfully! View your invoice: https://avitoluxury.in/invoice/${invoiceLink}. Thank you for shopping with Avito Luxury - Varnika Enterprises.`;
    } else {
      // This is a payment confirmation (original behavior)
      // This is a payment confirmation (original behavior)
      message = `Dear Customer,

We have received your order successfully for Rs. ${totalAmount}. Your order ID is ${trackingId}. You can track your order here: https://avitoluxury.in/order-tracking.
Thanks for choosing Avito Luxury.

-Varnika Enterprises
`;
    }
    
    // Use 2Factor.in API to send SMS
    const apiKey = process.env.TWO_FACTOR_API_KEY || "d4b37114-5f02-11f0-a562-0200cd936042";
    const sender = process.env.TWO_FACTOR_SENDER_ID || 'AVITOS';
    
    // Format phone number (remove country code if present)
    const formattedPhone = formatPhoneNumber(phone);
    
    console.log('Sending SMS to:', formattedPhone);
    console.log('Message:', message);
    
    // Determine which template to use based on whether this is a delivery notification
    const templateName = invoiceLink ? 
      (process.env.TWO_FACTOR_DELIVERY_TEMPLATE_NAME || 'Avito delivery') : 
      (process.env.TWO_FACTOR_TEMPLATE_NAME || 'Avito Order');
    
    console.log('Using template name:', templateName);
    
    // Try to send using template first if template name is provided
    if (templateName) {
      try {
        // Prepare the data for template SMS
        const formData = new URLSearchParams();
        formData.append('module', 'TRANS_SMS');
        formData.append('apikey', apiKey);
        formData.append('to', formattedPhone);
        formData.append('from', sender);
        formData.append('templatename', templateName);
        
        if (invoiceLink) {
          // Delivery notification template variables
          formData.append('var1', customerName);
          formData.append('var2', invoiceLink);
        } else {
          // Order confirmation template variables
          formData.append('var1', customerName);
          formData.append('var2', totalAmount.toString());
          formData.append('var3', trackingId);
          formData.append('var4', 'https://avitoluxury.in/track-order');
        }
        
        console.log('Sending with template variables:', Object.fromEntries(formData));
        
        // Make the API call for template SMS
        const templateResponse = await fetch('https://2factor.in/API/V1/' + apiKey + '/ADDON_SERVICES/SEND/TSMS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });
        
        const templateData = await templateResponse.json();
        console.log('Template SMS response:', templateData);
        
        if (templateData && templateData.Status === 'Success') {
          console.log('SMS sent successfully with template');
          return true;
        }
        
        // If template sending fails, fall back to direct message
        console.log('Template SMS failed, falling back to direct message');
      } catch (templateError) {
        console.error('Error sending template SMS:', templateError);
        console.log('Falling back to direct message');
      }
    }
    
    // Fall back to direct message sending
    // Prepare the data for direct message sending
    const formData = new URLSearchParams();
    formData.append('apikey', apiKey);
    formData.append('to', formattedPhone);
    formData.append('from', sender);
    formData.append('text', message);
    
    // Make the API call for direct SMS
    const response = await fetch('https://2factor.in/API/V1/' + apiKey + '/SMS/' + formattedPhone + '/' + encodeURIComponent(message), {
      method: 'GET',
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
