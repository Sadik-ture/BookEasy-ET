import mongoose from "mongoose";

// One document per staff member per reserved 15-minute block.
// The UNIQUE index makes it impossible for two bookings to reserve the same block.
const bookingSlotSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
  slotStart: { type: Date, required: true },
});

bookingSlotSchema.index({ staffId: 1, slotStart: 1 }, { unique: true });

export default mongoose.model("BookingSlot", bookingSlotSchema);