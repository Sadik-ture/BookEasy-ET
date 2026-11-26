import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday
    start: { type: String, default: "09:00" },
    end: { type: String, default: "18:00" },
    breakStart: { type: String },
    breakEnd: { type: String },
    off: { type: Boolean, default: false },
  },
  { _id: false }
);

const staffSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    title: { type: String, trim: true, maxlength: 80, default: "" },
    avatar: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    // Days not listed here are days off. Empty list = follows business hours.
    workingHours: [shiftSchema],
    timeOff: [
      {
        _id: false,
        startDate: { type: String, required: true },
        endDate: { type: String, required: true },
        reason: { type: String, trim: true, maxlength: 120, default: "" },
      },
    ],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

staffSchema.index({ businessId: 1, name: 1 }, { unique: true });

export default mongoose.model("Staff", staffSchema);