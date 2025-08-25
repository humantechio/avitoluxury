const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: '.env' });

// Test the complete OTP flow
async function debugOTPFlow() {
  console.log('🔍 Debugging OTP Flow...\n');
  
  // 1. Check environment variables
  console.log('1. Environment Variables:');
  console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
  console.log('   TWOFACTOR_API_KEY:', process.env.TWOFACTOR_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('   TWO_FACTOR_API_KEY:', process.env.TWO_FACTOR_API_KEY ? '✅ Set' : '❌ Missing');
  
  // 2. Test MongoDB connection
  console.log('\n2. MongoDB Connection:');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✅ MongoDB connected successfully');
    
    // Check if OTP collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const otpCollection = collections.find(col => col.name === 'otps');
    console.log('   OTP Collection:', otpCollection ? '✅ Exists' : '⚠️  Will be created on first use');
    
    await mongoose.disconnect();
  } catch (error) {
    console.log('   ❌ MongoDB connection failed:', error.message);
    return;
  }
  
  // 3. Test 2Factor API directly
  console.log('\n3. 2Factor API Test:');
  const apiKey = process.env.TWOFACTOR_API_KEY;
  const testPhone = '9876543210';
  
  try {
    const sendUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${testPhone}/AUTOGEN/OTP1`;
    const response = await axios.get(sendUrl);
    
    if (response.data && response.data.Status === 'Success') {
      console.log('   ✅ 2Factor API working');
      console.log('   Session ID:', response.data.Details);
      
      // Test verification with dummy OTP
      const verifyUrl = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${response.data.Details}/123456`;
      try {
        await axios.get(verifyUrl);
      } catch (verifyError) {
        if (verifyError.response?.data?.Status === 'Error') {
          console.log('   ✅ Verification endpoint working (correctly rejected dummy OTP)');
        }
      }
    } else {
      console.log('   ❌ 2Factor API failed:', response.data);
    }
  } catch (error) {
    console.log('   ❌ 2Factor API error:', error.response?.data || error.message);
  }
  
  // 4. Check if server is running (optional)
  console.log('\n4. Server Status:');
  try {
    const healthCheck = await axios.get('http://localhost:3000/api/checkout/send-otp', {
      method: 'POST',
      timeout: 2000
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ⚠️  Server not running on localhost:3000');
      console.log('   💡 Start server with: npm run dev');
    } else if (error.response?.status === 400) {
      console.log('   ✅ Server is running (got expected 400 error for empty request)');
    } else {
      console.log('   ⚠️  Server status unclear:', error.message);
    }
  }
  
  console.log('\n🔍 Debug Summary:');
  console.log('   - Check that all environment variables are set');
  console.log('   - Ensure MongoDB is accessible');
  console.log('   - Verify 2Factor API key is valid');
  console.log('   - Make sure Next.js server is running');
  console.log('   - Check browser console for frontend errors');
}

debugOTPFlow().catch(console.error);