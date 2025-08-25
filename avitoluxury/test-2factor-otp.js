const axios = require('axios');

// Test 2Factor OTP functionality
async function test2FactorOTP() {
  const apiKey = 'd4b37114-5f02-11f0-a562-0200cd936042'; // From .env file
  const testPhone = '9876543210'; // Test phone number
  
  console.log('Testing 2Factor OTP API...');
  console.log('API Key:', apiKey);
  console.log('Phone:', testPhone);
  
  try {
    // Step 1: Send OTP
    const sendUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${testPhone}/AUTOGEN/OTP1`;
    console.log('\n1. Sending OTP...');
    console.log('URL:', sendUrl);
    
    const sendResponse = await axios.get(sendUrl);
    console.log('Send Response:', JSON.stringify(sendResponse.data, null, 2));
    
    if (sendResponse.data && sendResponse.data.Status === 'Success') {
      const sessionId = sendResponse.data.Details;
      console.log('Session ID:', sessionId);
      
      // Step 2: Test verification (with a dummy OTP)
      const testOTP = '123456';
      const verifyUrl = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${testOTP}`;
      console.log('\n2. Testing verification...');
      console.log('URL:', verifyUrl);
      
      try {
        const verifyResponse = await axios.get(verifyUrl);
        console.log('Verify Response:', JSON.stringify(verifyResponse.data, null, 2));
      } catch (verifyError) {
        console.log('Verify Error (expected for dummy OTP):', verifyError.response?.data || verifyError.message);
      }
    } else {
      console.log('Failed to send OTP');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

test2FactorOTP();