import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../modules/users/user.model.js";
import { ensurePlans } from "../modules/subscriptions/defaults.js";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Set MONGODB_URI before seeding the platform.");
  process.exit(1);
}

await mongoose.connect(uri);
await ensurePlans();
console.log("Plans ready");

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;
if (email && password) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (!existing) {
    await User.create({
      fullName: "Platform Admin",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "super_admin",
    });
    console.log("Super admin created");
  } else if (existing.role !== "super_admin") {
    existing.role = "super_admin";
    await existing.save();
    console.log("Existing user promoted to super admin");
  } else {
    console.log("Super admin already exists");
  }
}

await mongoose.disconnect();
