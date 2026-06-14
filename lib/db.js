import mongoose from "mongoose";

// Prefer environment variable. If not set, do not attempt to connect to Atlas (use mock JSON fallback).
const MONGODB_URI = process.env.MONGODB_URI || null;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, failed: false };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (cached.failed) {
    throw new Error('MongoDB connection previously failed; using fallback');
  }

  if (!cached.promise) {
    if (!MONGODB_URI) {
      const err = new Error('MONGODB_URI not configured; skipping DB connect to allow JSON fallback in dev');
      console.warn(err.message);
      // Mark as failed so callers that expect a DB will fall back
      cached.failed = true;
      throw err;
    }
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1000,
      connectTimeoutMS: 1000,
      socketTimeoutMS: 30000,
      family: 4,
    };

    // sanitize environment-provided URI: trim, strip surrounding quotes, remove trailing semicolon
    let uriToUse = MONGODB_URI;
    if (typeof uriToUse === 'string') {
      // aggressively remove stray quotes, backslashes and trailing semicolons
      uriToUse = uriToUse.replace(/['"\\;]/g, '').trim();
    }
    // log only the scheme for safety (avoid printing credentials)
    const scheme = typeof uriToUse === 'string' && uriToUse.startsWith('mongodb+srv') ? 'mongodb+srv' : 'mongodb';
    console.log('Connecting with MONGODB_URI scheme:', scheme);
    cached.promise = mongoose.connect(uriToUse, opts).then((mongooseInstance) => {
      console.log('MongoDB Connected Successfully! 🔥');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.failed = true;
    console.error('MongoDB Connection Error:', e);
    // Common helpful hint for SRV lookup failures
    if (e && e.syscall === 'querySrv' && e.code === 'ECONNREFUSED') {
      console.error('Hint: SRV DNS lookup failed (ECONNREFUSED).\n - Try setting system DNS to 8.8.8.8 or 1.1.1.1\n - Or provide a non-SRV connection string (mongodb://...) in MONGODB_URI in .env.local');
    }
    throw e;
  }
}

export default dbConnect;