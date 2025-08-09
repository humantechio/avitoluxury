import mongoose from 'mongoose';

// Use environment variables for connection
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'ecommerce';

// Initialize mongoose connection cache
let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = {
  conn: null,
  promise: null
};

/**
 * Connect to MongoDB with error handling and connection pooling
 */
export async function connectToDatabase() {
  try {
    // Return cached connection if available
    if (cached.conn) {
      return cached.conn;
    }

    // Use cached connection promise if already connecting
    if (!cached.promise) {
      // Check for MongoDB URI in environment variables
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      const opts = {
        bufferCommands: true,
        autoIndex: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
        dbName: MONGODB_DB_NAME
      };

      // Create the connection promise with proper typing
      cached.promise = mongoose
        .connect(MONGODB_URI, opts)
        .then((mongoose) => {
          return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error: any) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error; // Propagate the error instead of setting up a fallback
  }
}

/**
 * Disconnect from MongoDB (useful for tests)
 */
export async function disconnectFromDatabase() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

/**
 * Check if the database is connected
 */
export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
} 