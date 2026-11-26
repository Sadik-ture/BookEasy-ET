import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, unique: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    status: { type: String, enum: ["trialing", "active", "past_due", "cancelled"], default: "trialing" },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    activatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
