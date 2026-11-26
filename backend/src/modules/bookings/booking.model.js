import mongoose from "mongoose";
import { BOOKING_STATUSES } from "./booking.constants.js";

const bookingSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    startAt: { type: Date, required: true }, // stored in UTC
    endAt: { type: Date, required: true },
    status: { type: String, enum: BOOKING_STATUSES, default: "pending" },

    // Snapshots, so later edits to services or staff don't rewrite history
    serviceName: { type: String, required: true },
    staffName: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    priceMinor: { type: Number, required: true },
    currency: { type: String, default: "ETB" },

    customerNotes: { type: String, trim: true, maxlength: 300, default: "" },
    cancelledAt: { type: Date },
    cancelledBy: { type: String, enum: ["customer", "business"] },
  },
  { timestamps: true }
);

bookingSchema.index({ businessId: 1, startAt: 1 });
bookingSchema.index({ customerId: 1, startAt: -1 });

export default mongoose.model("Booking", bookingSchema);