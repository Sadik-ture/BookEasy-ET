import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 600, default: "" },
    hidden: { type: Boolean, default: false },
    reply: { type: String, trim: true, maxlength: 600, default: "" },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

reviewSchema.index(
  { bookingId: 1 },
  { unique: true, partialFilterExpression: { bookingId: { $type: "objectId" } } }
);
reviewSchema.index(
  { orderId: 1 },
  { unique: true, partialFilterExpression: { orderId: { $type: "objectId" } } }
);
reviewSchema.index({ businessId: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
