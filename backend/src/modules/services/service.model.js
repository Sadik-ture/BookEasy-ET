import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 300, default: "" },
    // Money is stored in minor units: 100 minor = 1 birr
    priceMinor: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true, min: 5, max: 480 },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceSchema.index({ businessId: 1, name: 1 }, { unique: true });

export default mongoose.model("Service", serviceSchema);