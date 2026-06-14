import mongoose from "mongoose";

// Aapka sahi encoded password wala direct link
const MONGODB_URI = "mongodb+srv://shailendra:Vibe1234%40@cluster0.hux7z.mongodb.net/vibe_task_manager?retryWrites=true&w=majority";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Yahan direct MONGODB_URI variable pass ho raha hai bina kisi config galti ke
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("MongoDB Connected Successfully! 🔥");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB Connection Error:", e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;