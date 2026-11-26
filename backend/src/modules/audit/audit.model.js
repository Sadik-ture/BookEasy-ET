import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditSchema.index({ createdAt: -1 });
auditSchema.index({ businessId: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditSchema);
