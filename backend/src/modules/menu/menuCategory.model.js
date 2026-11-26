import mongoose from "mongoose";

const menuCategorySchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

menuCategorySchema.index({ businessId: 1, name: 1 }, { unique: true });

export default mongoose.model("MenuCategory", menuCategorySchema);