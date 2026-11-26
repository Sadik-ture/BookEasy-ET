import mongoose from "mongoose";
import { ensurePlans } from "../modules/subscriptions/defaults.js";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Make sure all indexes exist (the booking lock depends on a unique index)
    await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
    await ensurePlans();
    console.log("✅ Database indexes ready");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}