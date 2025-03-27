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
    const opts = {
      bufferCommands: false,
      // Better timeout values for serverless environments
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000, // Socket timeout increased
      serverSelectionTimeoutMS: 10000,
      // Reduced pool size for serverless environment
      maxPoolSize: 5,
      minPoolSize: 1,
      // Auto reconnect settings
      autoCreate: true,
      autoIndex: true,
      family: 4, // Use IPv4, avoids issues on some networks
    };

    mongoose.set('strictQuery', true);
    
    // Add error listeners to the mongoose connection
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      // Don't reset the promise here, let the main catch block handle it
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected - attempting to reconnect...');
      // Connection will auto-reconnect with the options above
    });

    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch((err) => {
        console.error('MongoDB connection failed:', err);
        // Reset promise on connection failure so we can retry
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    
    // Add a retry mechanism for transient errors
    // This is especially helpful in serverless environments
    const error = e as Error;
    if (error.name === 'MongooseServerSelectionError' || 
        error.message.includes('timeout') || 
        error.message.includes('Connection closed')) {
      console.warn('MongoDB connection retry after error:', error.message);
      // Wait a moment before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectDB(); // Recursive retry
    }
    
    throw e;
  }

  return cached.conn;
}

export default connectDB;