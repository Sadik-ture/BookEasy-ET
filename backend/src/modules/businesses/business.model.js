import mongoose from "mongoose";
import { CATEGORY_KEYS, BUSINESS_STATUSES } from "./business.constants.js";

const hoursSchema = new mongoose.Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday
    open: { type: String, default: "09:00" },
    close: { type: String, default: "18:00" },
    closed: { type: Boolean, default: false },
  },
  { _id: false }
);

const businessSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, enum: CATEGORY_KEYS, required: true },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    phone: { type: String, trim: true, default: "" },
    address: {
      line: { type: String, trim: true, default: "" },
      area: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "Addis Ababa" },
    },
    coverImage: { type: String, default: "" },
    logo: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    openingHours: [hoursSchema],
    timezone: { type: String, default: "Africa/Addis_Ababa" },
    status: { type: String, enum: BUSINESS_STATUSES, default: "pending" },
    // Placeholders until the reviews feature is built
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

businessSchema.index({ status: 1, category: 1, ratingCount: -1 });

export default mongoose.model("Business", businessSchema);