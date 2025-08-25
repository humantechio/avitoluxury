const axios = require('axios');

async function testCheckoutOTP() {
  const baseUrl = 'http://localhost:3000'; // Adjust if your server runs on different port
  const testPhone = '9876543210';
  
  console.log('Testing Checkout OTP API...');
  
  try {
    // Test sending OTP
    console.log('\n1. Testing send OTP...');
    const sendResponse = await axios.post(`${baseUrl}/api/checkout/send-otp`, {
      phone: testPhone
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Send OTP Response:', sendResponse.data);
    
    if (sendResponse.data.success) {
      console.log('✅ OTP sent successfully');
      
      // Test verification with dummy OTP
      console.log('\n2. Testing verify OTP with dummy code...');
      try {
        const verifyResponse = await axios.post(`${baseUrl}/api/checkout/verify-otp`, {
          phone: testPhone,
          otp: '123456'
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Verify OTP Response:', verifyResponse.data);
      } catch (verifyError) {
        console.log('Verify Error (expected for dummy OTP):', verifyError.response?.data);
      }
    } else {
      console.log('❌ Failed to send OTP:', sendResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your Next.js server is running on port 3000');
      console.log('   Run: npm run dev');
    }
  }
}

testCheckoutOTP();