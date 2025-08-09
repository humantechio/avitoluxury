const mongoose = require('mongoose');

async function removeSlugUniqueConstraint() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect("mongodb+srv://Yash:8BQEkh4JaATCGblO@yash.pweao0h.mongodb.net/ecommerce");
    console.log('Connected to MongoDB');

    // Get the products collection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    // Check if the products collection exists
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
removeSlugUniqueConstraint(); 