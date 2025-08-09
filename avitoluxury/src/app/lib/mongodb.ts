import mongoose from 'mongoose';

// Configure Mongoose in development mode
if (process.env.NODE_ENV === 'development') {
  mongoose.set('strictQuery', false);
  mongoose.set('autoIndex', false); // Disable automatic index creation to prevent warnings
}

// Hardcoded MongoDB URI
const MONGODB_URI = 'mongodb+srv://avitoluxury:l2AuSv97J5FW4ZvU@freetester.667mr8b.mongodb.net/ecommerce';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Global interface
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use a global variable to cache the mongoose connection
let globalWithMongoose = global as typeof globalThis & {
  mongoose: MongooseConnection;
};

// Initialize the cached connection
if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using mongoose
 * @returns Promise that resolves to the mongoose instance
 */
async function connectMongoDB(): Promise<typeof mongoose> {
  // If there's an existing connection, return it
  if (globalWithMongoose.mongoose.conn) {
    return globalWithMongoose.mongoose.conn;
  }

  // If a connection is in progress, wait for it
  if (!globalWithMongoose.mongoose.promise) {
    // Connect to the database
    console.log('Connecting to MongoDB...');
    
    if (!MONGODB_URI) {
      console.error('MONGODB_URI is undefined or empty!');
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    console.log('MongoDB URI format check:', 
      MONGODB_URI.startsWith('mongodb+srv://') ? 'Valid format' : 'Invalid format');
    
    globalWithMongoose.mongoose.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: true,
      // Add any other connection options if needed
      serverSelectionTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 30000,
    })
    .then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      console.error('Connection error details:', error.message);
      if (error.name === 'MongoNetworkError') {
        console.error('Network error - check your connection and MongoDB URI');
      } else if (error.name === 'MongoServerSelectionError') {
        console.error('Server selection error - MongoDB server may be down or unreachable');
      }
      
      globalWithMongoose.mongoose.promise = null;
      throw error;
    });
  }

  try {
    // Wait for the connection to be established
    globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
    return globalWithMongoose.mongoose.conn;
  } catch (error) {
    // Reset the promise if there's an error
    globalWithMongoose.mongoose.promise = null;
    console.error('Failed to establish MongoDB connection:', error);
    throw error;
  }
}

export default connectMongoDB; 