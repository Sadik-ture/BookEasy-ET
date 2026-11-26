import Booking from "../bookings/booking.model.js";
import BookingSlot from "../bookings/bookingSlot.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { todayInZone, addDays, zonedToUtc } from "../../utils/time.js";
import { ACTIVE_STATUSES } from "../bookings/booking.constants.js";

const fail = (res, status, code, message) => res.status(status).json({ success: false, error: { code, message } });

// new status -> statuses it may come from
const FROM = {
  confirmed: ["pending"],
  rejected: ["pending"],
  completed: ["confirmed"],
  no_show: ["confirmed"],
  cancelled: ["pending", "confirmed"],
};

const view = (b) => ({
  id: b._id,
  status: b.status,
  startAt: b.startAt,
  endAt: b.endAt,
  serviceName: b.serviceName,
  staffName: b.staffName,
  durationMinutes: b.durationMinutes,
  priceMinor: b.priceMinor,
  currency: b.currency,
  customerNotes: b.customerNotes,
  customer: b.customerId ? { name: b.customerId.fullName, phone: b.customerId.phone || "", email: b.customerId.email } : null,
});

// GET /api/v1/manage/bookings?scope=pending|today|upcoming|past
export const listBookings = asyncHandler(async (req, res) => {
  const scope = ["pending", "today", "upcoming", "past"].includes(req.query.scope) ? req.query.scope : "today";
  const tz = req.business.timezone;
  const today = todayInZone(tz);
  const start = zonedToUtc(today, 0, tz);
  const end = zonedToUtc(addDays(today, 1), 0, tz);

  const filter = { businessId: req.business._id };
  let sort = { startAt: 1 };
  if (scope === "pending") {
    filter.status = "pending";
    filter.startAt = { $gte: start };
  } else if (scope === "today") {
    filter.status = { $in: ["pending", "confirmed", "completed", "no_show"] };
    filter.startAt = { $gte: start, $lt: end };
  } else if (scope === "upcoming") {
    filter.status = { $in: ACTIVE_STATUSES };
    filter.startAt = { $gte: end };
  } else {
    filter.$or = [{ startAt: { $lt: start } }, { status: { $in: ["cancelled", "rejected", "completed", "no_show"] } }];
    sort = { startAt: -1 };
  }

  const items = await Booking.find(filter).sort(sort).limit(60).populate("customerId", "fullName email phone").lean();
  res.json({ success: true, data: { items: items.map(view) } });
});

// PATCH /api/v1/manage/bookings/:id/status
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!/^[a-f\d]{24}$/i.test(id)) return fail(res, 404, "NOT_FOUND", "Booking not found.");

  const set = { status };
  if (status === "cancelled" || status === "rejected") {
    set.cancelledAt = new Date();
    set.cancelledBy = "business";
  }

  // Atomic and scoped to THIS business: only a valid move from the current status succeeds
  const booking = await Booking.findOneAndUpdate(
    { _id: id, businessId: req.business._id, status: { $in: FROM[status] } },
    { $set: set },
    { new: true }
  );
  if (!booking) return fail(res, 409, "INVALID_STATUS", "This booking can't be changed that way. Refresh and try again.");

  if (status === "cancelled" || status === "rejected") {
    await BookingSlot.deleteMany({ bookingId: booking._id }); // frees the time for other customers
  }
  res.json({ success: true, data: { id: booking._id, status: booking.status } });
});