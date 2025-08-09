// Simple script to test Cloudinary configuration
const cloudinary = require('cloudinary').v2;

// Configure with hardcoded values
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log('Cloudinary configuration test:');
console.log('- Cloud name:', cloudinary.config().cloud_name);
console.log('- API key:', cloudinary.config().api_key);

// Test connection by getting account info
async function testConnection() {
  try {
    console.log('\nTesting connection to Cloudinary...');
    const result = await cloudinary.api.ping();
    console.log('Connection successful!', result);
    
    // Get account usage info
    const usage = await cloudinary.api.usage();
    console.log('\nAccount usage:', usage);
    
    return true;
  } catch (error) {
    console.error('\nConnection failed:', error);
    return false;
  }
}

testConnection(); 