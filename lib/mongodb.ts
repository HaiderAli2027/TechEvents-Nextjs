import mongoose from 'mongoose';

/**
 * MongoDB connection interface for type safety
 */
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Global variable to cache the database connection.
 * In development, this prevents exhausting the database connection limit.
 */
declare global {
  var mongooseConnection: MongooseConnection;
}

// Initialize the global connection object if it doesn't exist
let cached: MongooseConnection = global.mongooseConnection || { conn: null, promise: null };

if (!global.mongooseConnection) {
  global.mongooseConnection = cached;
}

/**
 * Establishes or retrieves a cached connection to MongoDB using Mongoose.
 *
 * @returns {Promise<typeof mongoose>} The Mongoose instance with an active connection
 * @throws {Error} If MONGODB_URI environment variable is not set
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return cached connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // If connection is in progress, wait for it to complete
  if (!cached.promise) {
    const mongodbUri = process.env.MONGODB_URI;

    // Validate that MongoDB URI is configured
    if (!mongodbUri) {
      throw new Error(
        'Please define the MONGODB_URI environment variable in .env.local'
      );
    }

    // Create a new connection promise
    cached.promise = mongoose
      .connect(mongodbUri, {
        // Connection options for production stability
        maxPoolSize: 10,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  // Wait for the promise to resolve and cache the connection
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
