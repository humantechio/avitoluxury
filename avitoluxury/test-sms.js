// Test script for SMS functionality
require('dotenv').config();

const { testSMSConnection, sendOrderDeliveredSMS } = require('./src/app/lib/sms-utils.ts');

async function testSMS() {
  console.log('Testing SMS functionality...');
  
  // Test phone number (replace with actual test number)
  const testPhone = '8126518755';
  
  console.log('Environment variables check:');
  console.log('TWO_FACTOR_API_KEY:', process.env.TWO_FACTOR_API_KEY ? 'Set' : 'Not set');
  console.log('TWOFACTOR_API_KEY:', process.env.TWOFACTOR_API_KEY ? 'Set' : 'Not set');
  
  try {
    // Test basic connectivity
    console.log('\n1. Testing basic SMS connectivity...');
    const connectivityResult = await testSMSConnection(testPhone);
    console.log('Connectivity test result:', connectivityResult);
    
    // Test delivery SMS
    console.log('\n2. Testing delivery SMS...');
    const deliveryResult = await sendOrderDeliveredSMS({
      phone: testPhone,
      trackingId: 'TEST-123456'
    });
    console.log('Delivery SMS test result:', deliveryResult);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSMS();