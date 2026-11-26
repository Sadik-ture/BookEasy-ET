import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: { type: String, default: "" },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
