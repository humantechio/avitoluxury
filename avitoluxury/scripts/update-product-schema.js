require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Import the MongoDB connection function from our app
const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb+srv://Yash:8BQEkh4JaATCGblO@yash.pweao0h.mongodb.net/ecommerce";
    
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return false;
  }
};

async function updateProductSchema() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const connected = await connectMongoDB();
    if (!connected) {
      console.error('Failed to connect to MongoDB');
      return;
    }
    
    // Get the database connection
    const db = mongoose.connection.db;
    
    // Check if the products collection exists
    const collections = await db.listCollections().toArray();
    const productsCollection = collections.find(c => c.name === 'products');
    
    if (!productsCollection) {
      console.log('Products collection not found');
      return;
    }
    
    // Get existing indexes
    const indexes = await db.collection('products').indexes();
    console.log('Current indexes:', indexes);
    
    // Check if slug_1 index exists
    const slugIndex = indexes.find(idx => idx.name === 'slug_1');
    if (slugIndex) {
      // Drop the unique index on slug
      console.log('Dropping unique index on slug field...');
      await db.collection('products').dropIndex('slug_1');
      console.log('Successfully dropped unique index on slug field');
      
      // Create a new non-unique index on slug
      console.log('Creating new non-unique index on slug field...');
      await db.collection('products').createIndex({ slug: 1 }, { unique: false });
      console.log('Successfully created non-unique index on slug field');
    } else {
      console.log('No unique constraint found on slug field');
    }
    
    console.log('Operation completed successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
updateProductSchema(); 