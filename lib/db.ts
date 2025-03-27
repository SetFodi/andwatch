// lib/db.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Important serverless settings for MongoDB connection
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10000, // Increased from 5000
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000, // Increased from 5000
      maxPoolSize: 5, // Reduced to prevent connection overload
      minPoolSize: 1,
      family: 4, // Force IPv4
      heartbeatFrequencyMS: 5000, // Add heartbeat to keep connection alive
      autoIndex: false, // Don't build indexes on connection
      maxIdleTimeMS: 10000, // Close idle connections after 10 seconds
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
    };

    // Log connection attempt
    console.log('MongoDB connection attempt started');
    
    mongoose.set('strictQuery', true);
    
    // Add global event handlers for all connections
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      if (err.name === 'MongoNetworkError' || 
          err.message.includes('connection closed') ||
          err.message.includes('getaddrinfo')) {
        console.log('Resetting MongoDB connection cache due to network error');
        cached.conn = null;
        cached.promise = null;
      }
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected - connection will automatically reconnect');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
    
    // Create connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB successfully');
        return mongoose;
      })
      .catch((err) => {
        console.error('MongoDB connection failed:', err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Error awaiting MongoDB connection:', e);
    
    // Add a retry mechanism for specific transient errors
    const error = e as Error;
    if (error.name === 'MongooseServerSelectionError' || 
        error.message.includes('timeout') || 
        error.message.includes('Connection closed')) {
      console.warn('MongoDB connection retry after error:', error.message);
      // Clear the cache to force a fresh connection attempt
      cached.conn = null;
      cached.promise = null;
      
      // Wait a moment before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectDB(); // Recursive retry
    }
    
    throw e;
  }

  return cached.conn;
}

export default connectDB;

// Export a direct connection function for immediate use
export async function getDbConnection() {
  try {
    return await connectDB();
  } catch (error) {
    console.error('Failed to get DB connection:', error);
    throw error;
  }
}

// Add a lightweight health check function
export async function checkDbConnection() {
  try {
    const conn = await connectDB();
    return { status: 'connected', readyState: conn.connection.readyState };
  } catch (error) {
    return { status: 'error', message: (error as Error).message };
  }
}