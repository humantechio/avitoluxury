// 2Factor.in SMS utility functions
// This file contains utilities for sending SMS via 2Factor.in API

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Format phone number for 2Factor.in API (ensure proper format)
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) {
    console.error('Phone number is undefined or empty');
    return '';
  }

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // If it's a 10-digit number, add country code for India
  if (digits.length === 10) {
    return '91' + digits;
  }

  // If it already has country code (like 91xxxxxxxxxx), use as is
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }

  // If it has +91 prefix, remove the + and use the digits
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits;
  }

  // Return the digits as is if not empty
  console.warn('Unusual phone number format:', phoneNumber, 'digits:', digits);
  return digits;
};

// Send OTP to admin phone via 2Factor.in
export const sendAdminSMS = async (phoneNumber: string): Promise<boolean> => {
  try {
    const apiKey = process.env.TWO_FACTOR_API_KEY;
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Generate OTP
    const otp = generateOTP();

    // Prepare the data for OTP sending
    const formData = new URLSearchParams();
    formData.append('module', 'TRANS_SMS');
    formData.append('apikey', apiKey || '');
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
    const apiKey = process.env.TWO_FACTOR_API_KEY;
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
    const apiKey = process.env.TWO_FACTOR_API_KEY;
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
    formData.append('apikey', apiKey || '');
    formData.append('to', formattedPhone);
    formData.append('from', sender);
    formData.append('templatename', templateName);

    // If order data is provided, use it for variables
    if (orderData) {
      formData.append('var1', orderData.amount.toString());
      formData.append('var2', orderData.trackingId);
    } else {
      // Use placeholder values for testing
      formData.append('var2', '1999');
      formData.append('var3', 'TRK789012');
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

// Send order confirmation SMS (for new orders)
export const sendOrderConfirmationSMS = async (
  orderData: {
    phone: string;
    customerName?: string;
    trackingId: string;
    transactionId: string;
    totalAmount: number;
    trackingLink?: string;
  }
): Promise<boolean> => {
  try {
    const { phone, trackingId, totalAmount } = orderData;
    const apiKey = process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY;
    const sender = process.env.TWO_FACTOR_SENDER_ID || 'AVITOS';
    const templateName = process.env.TWO_FACTOR_TEMPLATE_NAME || 'Avito Orderrr';

    // Format phone number (remove country code if present)
    const formattedPhone = formatPhoneNumber(phone);

    if (!formattedPhone) {
      console.error('Phone number is empty or invalid');
      return false;
    }

    console.log('Sending order confirmation SMS to:', formattedPhone);

    // Order confirmation message
    const message = `Dear Customer,We have received your order successfully for Rs. ${totalAmount}. Your order ID is ${trackingId}. You can track your order here: https://avitoluxury.in/order-tracking. Thanks for choosing Avito Luxury.-Varnika Enterprises`;

    // Try template SMS first
    try {
      const formData = new URLSearchParams();
      formData.append('module', 'TRANS_SMS');
      formData.append('apikey', apiKey || '');
      formData.append('to', formattedPhone);
      formData.append('from', sender);
      formData.append('templatename', templateName);
      formData.append('var1', totalAmount.toString());
      formData.append('var2', trackingId);

      const templateResponse = await fetch('https://2factor.in/API/V1/' + apiKey + '/ADDON_SERVICES/SEND/TSMS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const templateData = await templateResponse.json();
      console.log('Order confirmation template SMS response:', templateData);

      if (templateData && templateData.Status === 'Success') {
        console.log('Order confirmation SMS sent successfully with template');
        return true;
      }
    } catch (templateError) {
      console.error('Template SMS failed, falling back to direct message:', templateError);
    }

    // Fallback to direct SMS using R1 API
    const fallbackFormData = new URLSearchParams();
    fallbackFormData.append('module', 'TRANS_SMS');
    fallbackFormData.append('apikey', apiKey || '');
    fallbackFormData.append('to', formattedPhone);
    fallbackFormData.append('from', sender);
    fallbackFormData.append('msg', message);

    const response = await fetch('https://2factor.in/API/R1/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: fallbackFormData.toString(),
    });

    const data = await response.json();
    console.log('Order confirmation SMS response:', data);

    return data && data.Status === 'Success';
  } catch (error) {
    console.error('Error sending order confirmation SMS:', error);
    return false;
  }
};

// Format phone number for R1 API (10 digits without country code)
const formatPhoneForR1 = (phoneNumber: string): string => {
  if (!phoneNumber) {
    return '';
  }

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // If it's a 10-digit number, use as is
  if (digits.length === 10) {
    return digits;
  }

  // If it has country code (like 91xxxxxxxxxx), remove it
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.substring(2);
  }

  // If it's longer and starts with 91, remove the 91
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.substring(2);
  }

  return digits;
};

// Send order delivered SMS (for delivered orders)
export const sendOrderDeliveredSMS = async (
  orderData: {
    phone: string;
    trackingId: string;
  }
): Promise<boolean> => {
  try {
    const { phone, trackingId } = orderData;
    const apiKey = process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
      console.error('API key not found in environment variables');
      return false;
    }

    const phoneForR1 = formatPhoneForR1(phone);
    if (!phoneForR1 || phoneForR1.length !== 10) {
      console.error('Phone number is invalid:', phone, 'formatted:', phoneForR1);
      return false;
    }

    console.log('Sending delivery SMS to:', phoneForR1, 'for order:', trackingId);

    // Delivery notification message
    const message = `Hello, Your order has been delivered successfully! View your invoice: https://avitoluxury.in/invoice/${trackingId}. Thank you for shopping with Avito Luxury - Varnika Enterprises.`;

    // Method 1: Try template SMS with AVITOS sender
    try {
      console.log('Trying template SMS with AVITOS sender...');
      const templateFormData = new URLSearchParams();
      templateFormData.append('module', 'TRANS_SMS');
      templateFormData.append('apikey', apiKey);
      templateFormData.append('to', phoneForR1);
      templateFormData.append('from', 'AVITOS');
      templateFormData.append('templatename', 'Avito delivery');
      templateFormData.append('var1', trackingId);

      const templateResponse = await fetch('https://2factor.in/API/V1/' + apiKey + '/ADDON_SERVICES/SEND/TSMS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: templateFormData.toString(),
      });

      const templateData = await templateResponse.json();
      console.log('Template SMS (AVITOS) response:', templateData);

      if (templateData && templateData.Status === 'Success') {
        console.log('Delivery SMS sent successfully with AVITOS template');
        return true;
      }
    } catch (error) {
      console.error('Template SMS with AVITOS failed:', error);
    }

    // Method 2: Try template SMS with AVIOS sender
    try {
      console.log('Trying template SMS with AVIOS sender...');
      const templateFormData = new URLSearchParams();
      templateFormData.append('module', 'TRANS_SMS');
      templateFormData.append('apikey', apiKey);
      templateFormData.append('to', phoneForR1);
      templateFormData.append('from', 'AVIOS');
      templateFormData.append('templatename', 'Avito delivery');
      templateFormData.append('var1', trackingId);

      const templateResponse = await fetch('https://2factor.in/API/V1/' + apiKey + '/ADDON_SERVICES/SEND/TSMS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: templateFormData.toString(),
      });

      const templateData = await templateResponse.json();
      console.log('Template SMS (AVIOS) response:', templateData);

      if (templateData && templateData.Status === 'Success') {
        console.log('Delivery SMS sent successfully with AVIOS template');
        return true;
      }
    } catch (error) {
      console.error('Template SMS with AVIOS failed:', error);
    }

    // Method 3: Try R1 API with AVITOS (direct message)
    try {
      console.log('Trying R1 API with AVITOS...');
      const r1FormData = new URLSearchParams();
      r1FormData.append('module', 'TRANS_SMS');
      r1FormData.append('apikey', apiKey);
      r1FormData.append('to', phoneForR1);
      r1FormData.append('from', 'AVITOS');
      r1FormData.append('msg', message);

      const r1Response = await fetch('https://2factor.in/API/R1/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: r1FormData.toString(),
      });

      const r1Data = await r1Response.json();
      console.log('R1 API (AVITOS) response:', r1Data);

      if (r1Data && r1Data.Status === 'Success') {
        console.log('Delivery SMS sent successfully via R1 with AVITOS');
        return true;
      }
    } catch (error) {
      console.error('R1 API with AVITOS failed:', error);
    }

    // Method 4: Try R1 API with AVIOS (direct message)
    try {
      console.log('Trying R1 API with AVIOS...');
      const r1FormData = new URLSearchParams();
      r1FormData.append('module', 'TRANS_SMS');
      r1FormData.append('apikey', apiKey);
      r1FormData.append('to', phoneForR1);
      r1FormData.append('from', 'AVIOS');
      r1FormData.append('msg', message);

      const r1Response = await fetch('https://2factor.in/API/R1/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: r1FormData.toString(),
      });

      const r1Data = await r1Response.json();
      console.log('R1 API (AVIOS) response:', r1Data);

      if (r1Data && r1Data.Status === 'Success') {
        console.log('Delivery SMS sent successfully via R1 with AVIOS');
        return true;
      }
    } catch (error) {
      console.error('R1 API with AVIOS failed:', error);
    }

    console.log('All delivery SMS methods failed for phone:', phone);
    return false;
  } catch (error) {
    console.error('Error sending order delivered SMS:', error);
    return false;
  }
};

// Test SMS function to verify API connectivity
export const testSMSConnection = async (phone: string): Promise<boolean> => {
  try {
    const apiKey = process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
      console.error('API key not found');
      return false;
    }

    const phoneForR1 = formatPhoneForR1(phone);
    const testMessage = 'Test message from Avito Luxury - API connectivity check';

    // Try simple R1 API call
    const formData = new URLSearchParams();
    formData.append('module', 'TRANS_SMS');
    formData.append('apikey', apiKey);
    formData.append('to', phoneForR1);
    formData.append('from', process.env.TWO_FACTOR_SENDER_ID || 'AVITOS');
    formData.append('msg', testMessage);

    const response = await fetch('https://2factor.in/API/R1/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();
    console.log('Test SMS response:', data);

    return data && data.Status === 'Success';
  } catch (error) {
    console.error('Error testing SMS connection:', error);
    return false;
  }
};
