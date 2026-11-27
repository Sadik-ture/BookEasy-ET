import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    label: { type: String, required: true, trim: true, maxlength: 30 },
    // What the QR code contains. Opaque and random: it says nothing about the restaurant or table.
    code: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tableSchema.index({ businessId: 1, label: 1 }, { unique: true });

export default mongoose.model("Table", tableSchema);