import mongoose from "mongoose";
import { BUSINESS_ROLES } from "./permissions.js";

const membershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    role: { type: String, enum: BUSINESS_ROLES, required: true },
    // When set, these replace the role defaults. Owners use this to limit a manager.
    permissions: [{ type: String }],
    status: { type: String, enum: ["active", "removed"], default: "active" },
  },
  { timestamps: true }
);

membershipSchema.index({ userId: 1, businessId: 1 }, { unique: true });
membershipSchema.index({ businessId: 1, status: 1 });

export default mongoose.model("Membership", membershipSchema);
