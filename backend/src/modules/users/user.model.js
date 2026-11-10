import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    passwordHash: { type: String, required: true, select: false },
    // Platform-level role. Business roles (owner, manager...) come later via memberships.
    role: { type: String, enum: ["customer", "support_admin", "super_admin"], default: "customer" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);