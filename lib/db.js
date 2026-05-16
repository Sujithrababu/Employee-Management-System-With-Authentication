import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("MongoDB connection error:", error.message);
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

export default connectDB;
