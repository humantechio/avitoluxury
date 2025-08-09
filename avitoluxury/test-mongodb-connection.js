// Script to test MongoDB connection
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('MongoDB URI:', MONGODB_URI ? 'URI found' : 'URI not found');

async function testConnection() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    return;
  }
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connection successful!');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

testConnection(); 