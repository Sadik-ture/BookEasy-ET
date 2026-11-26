import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuCategory", required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 200, default: "" },
    // Money is stored in minor units: 100 minor = 1 birr
    priceMinor: { type: Number, required: true, min: 0, validate: Number.isInteger },
    image: { type: String, default: "" },
    available: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

menuItemSchema.index({ businessId: 1, name: 1 }, { unique: true });
menuItemSchema.index({ businessId: 1, categoryId: 1, sortOrder: 1 });

export default mongoose.model("MenuItem", menuItemSchema);