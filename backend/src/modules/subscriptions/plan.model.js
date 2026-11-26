import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    monthlyPriceMinor: { type: Number, required: true, min: 0 },
    setupFeeMinor: { type: Number, required: true, min: 0 },
    limits: {
      maxStaff: { type: Number, required: true, min: 1 },
      maxMenuItems: { type: Number, required: true, min: 1 },
      maxTables: { type: Number, required: true, min: 1 },
      reports: { type: Boolean, default: false },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);
