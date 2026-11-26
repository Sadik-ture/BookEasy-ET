import mongoose from "mongoose";
import Business from "../businesses/business.model.js";
import Service from "../services/service.model.js";
import Staff from "../staff/staff.model.js";
import Booking from "./booking.model.js";
import BookingSlot from "./bookingSlot.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { zonedToUtc, toMinutes } from "../../utils/time.js";
import { getDayAvailability } from "./availability.service.js";
import { BOOKABLE_CATEGORIES, ACTIVE_STATUSES, SLOT_MINUTES, slotsNeeded } from "./booking.constants.js";
import { notifyUser, notifyBusiness } from "../notifications/notify.js";

const SLOT_MS = SLOT_MINUTES * 60_000;

const fail = (res, status, code, message, fields) =>
  res.status(status).json({
    success: false,
    error: { code, message, ...(fields ? { fields } : {}) },
  });

const isDuplicateKey = (err) =>
  err?.code === 11000 || err?.writeErrors?.some?.((e) => e.code === 11000);

const view = (b, business) => ({
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
  business: business
    ? {
        id: business._id,
        name: business.name,
        slug: business.slug,
        category: business.category,
        address: business.address,
        timezone: business.timezone,
      }
    : null,
});

// POST /api/v1/bookings
export const createBooking = asyncHandler(async (req, res) => {
  const { businessId, serviceId, staffId, date, time, notes } = req.body;

  const business = await Business.findOne({
    _id: businessId,
    status: "approved",
    category: { $in: BOOKABLE_CATEGORIES },
  });
  if (!business) return fail(res, 404, "NOT_FOUND", "Business not found.");
  if (business.acceptingRequests === false) {
    return fail(res, 409, "NOT_ACCEPTING", `${business.name} is not taking new bookings right now.`);
  }

  // The service must belong to THIS business (tenant check)
  const service = await Service.findOne({ _id: serviceId, businessId: business._id, active: true });
  if (!service) return fail(res, 404, "NOT_FOUND", "Service not found.");

  const startAt = zonedToUtc(date, toMinutes(time), business.timezone);

  // Duplicate-submit protection: same customer, same business and time -> return the existing booking
  const existing = await Booking.findOne({
    customerId: req.user._id,
    businessId: business._id,
    startAt,
    status: { $in: ACTIVE_STATUSES },
  });
  if (existing) {
    return res.json({ success: true, data: { booking: view(existing, business) } });
  }

  // Server re-checks availability (the browser's list can be stale)
  const day = await getDayAvailability({ business, service, date, staffId: staffId || null });
  const slot = day.times.find((t) => t.time === time);
  if (!slot) {
    return fail(res, 409, "SLOT_UNAVAILABLE", "That time is no longer available. Please pick another time.", {
      time: "That time is no longer available.",
    });
  }

  const needed = slotsNeeded(service.durationMinutes);
  const endAt = new Date(slot.startAt.getTime() + service.durationMinutes * 60_000);
  const bookingId = new mongoose.Types.ObjectId();

  // Try each eligible professional until one reservation succeeds.
  // The unique index on (staffId, slotStart) is the real protection against double booking.
  let chosenStaffId = null;
  for (const sid of slot.staffIds) {
    const docs = Array.from({ length: needed }, (_, i) => ({
      staffId: sid,
      businessId: business._id,
      bookingId,
      slotStart: new Date(slot.startAt.getTime() + i * SLOT_MS),
    }));
    try {
      await BookingSlot.insertMany(docs, { ordered: true });
      chosenStaffId = sid;
      break;
    } catch (err) {
      await BookingSlot.deleteMany({ bookingId }); // release any partial reservation
      if (isDuplicateKey(err)) continue; // someone else got it, try the next professional
      throw err;
    }
  }

  if (!chosenStaffId) {
    return fail(res, 409, "SLOT_TAKEN", "Sorry, that time was just taken. Please pick another time.", {
      time: "That time was just taken.",
    });
  }

  const staff = await Staff.findById(chosenStaffId).select("name").lean();

  let booking;
  try {
    booking = await Booking.create({
      _id: bookingId,
      businessId: business._id,
      customerId: req.user._id,
      serviceId: service._id,
      staffId: chosenStaffId,
      startAt: slot.startAt,
      endAt,
      status: business.bookingSettings?.autoConfirm ? "confirmed" : "pending",
      serviceName: service.name,
      staffName: staff?.name || "Staff",
      durationMinutes: service.durationMinutes,
      priceMinor: service.priceMinor, // price snapshot taken on the server
      customerNotes: notes || "",
    });
  } catch (err) {
    await BookingSlot.deleteMany({ bookingId });
    throw err;
  }

  await notifyUser({
    userId: req.user._id,
    businessId: business._id,
    type: "booking",
    title: booking.status === "confirmed" ? "Booking confirmed" : "Booking request sent",
    body: `${service.name} at ${business.name}.`,
    link: "/my-bookings",
  });
  await notifyBusiness(business._id, "bookings", {
    type: "booking",
    title: "New booking",
    body: `${req.user.fullName} booked ${service.name}.`,
    link: "/workspace/bookings",
  });

  res.status(201).json({ success: true, data: { booking: view(booking, business) } });
});

// GET /api/v1/bookings/my?scope=upcoming|past
export const myBookings = asyncHandler(async (req, res) => {
  const scope = req.query.scope === "past" ? "past" : "upcoming";
  const now = new Date();

  const filter = { customerId: req.user._id }; // customers only ever see their own bookings
  let sort;
  if (scope === "upcoming") {
    filter.status = { $in: ACTIVE_STATUSES };
    filter.startAt = { $gte: now };
    sort = { startAt: 1 };
  } else {
    filter.$or = [{ startAt: { $lt: now } }, { status: { $nin: ACTIVE_STATUSES } }];
    sort = { startAt: -1 };
  }

  const items = await Booking.find(filter)
    .sort(sort)
    .limit(50)
    .populate("businessId", "name slug category address timezone")
    .lean();

  res.json({ success: true, data: { items: items.map((b) => view(b, b.businessId)) } });
});

// PATCH /api/v1/bookings/:id/cancel
export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!/^[a-f\d]{24}$/i.test(id)) return fail(res, 404, "NOT_FOUND", "Booking not found.");

  // Atomic: only the owner, only active, only in the future
  const booking = await Booking.findOneAndUpdate(
    { _id: id, customerId: req.user._id, status: { $in: ACTIVE_STATUSES }, startAt: { $gt: new Date() } },
    { $set: { status: "cancelled", cancelledAt: new Date(), cancelledBy: "customer" } },
    { new: true }
  );
  if (!booking) {
    return fail(res, 404, "NOT_FOUND", "Booking not found or can no longer be cancelled.");
  }

  await BookingSlot.deleteMany({ bookingId: booking._id }); // frees the time for others
  await notifyBusiness(booking.businessId, "bookings", {
    type: "booking",
    title: "Booking cancelled",
    body: `${booking.serviceName} was cancelled by the customer.`,
    link: "/workspace/bookings",
  });
  res.json({ success: true, data: { id: booking._id, status: booking.status } });
});

export const getBooking = asyncHandler(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) return fail(res, 404, "NOT_FOUND", "Booking not found.");
  const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user._id }).populate(
    "businessId",
    "name slug category address timezone"
  );
  if (!booking) return fail(res, 404, "NOT_FOUND", "Booking not found.");
  res.json({ success: true, data: { booking: view(booking, booking.businessId) } });
});

export const rescheduleBooking = asyncHandler(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) return fail(res, 404, "NOT_FOUND", "Booking not found.");
  const booking = await Booking.findOne({
    _id: req.params.id,
    customerId: req.user._id,
    status: { $in: ACTIVE_STATUSES },
    startAt: { $gt: new Date() },
  });
  if (!booking) return fail(res, 404, "NOT_FOUND", "Booking not found or can no longer be moved.");

  const business = await Business.findById(booking.businessId);
  const service = await Service.findOne({ _id: booking.serviceId, businessId: booking.businessId, active: true });
  if (!business || business.status !== "approved" || !service) return fail(res, 404, "NOT_FOUND", "Booking not found.");
  if (business.acceptingRequests === false) {
    return fail(res, 409, "NOT_ACCEPTING", `${business.name} is not taking changes right now.`);
  }

  const { date, time } = req.body;
  const day = await getDayAvailability({ business, service, date, staffId: booking.staffId });
  const slot = day.times.find((t) => t.time === time);
  if (!slot) {
    return fail(res, 409, "SLOT_UNAVAILABLE", "That time is no longer available. Please pick another time.");
  }

  const needed = slotsNeeded(service.durationMinutes);
  const previous = await BookingSlot.find({ bookingId: booking._id }).lean();
  await BookingSlot.deleteMany({ bookingId: booking._id });
  const docs = Array.from({ length: needed }, (_, i) => ({
    staffId: booking.staffId,
    businessId: business._id,
    bookingId: booking._id,
    slotStart: new Date(slot.startAt.getTime() + i * SLOT_MS),
  }));

  try {
    await BookingSlot.insertMany(docs, { ordered: true });
  } catch (err) {
    try {
      if (previous.length) {
        await BookingSlot.insertMany(previous.map(({ _id, __v, ...rest }) => rest));
      }
    } catch (restoreErr) {
      console.error("could not restore booking slots:", restoreErr.message);
    }
    if (isDuplicateKey(err)) {
      return fail(res, 409, "SLOT_TAKEN", "Sorry, that time was just taken. Please pick another time.");
    }
    throw err;
  }

  booking.startAt = slot.startAt;
  booking.endAt = new Date(slot.startAt.getTime() + service.durationMinutes * 60_000);
  await booking.save();
  res.json({ success: true, data: { booking: view(booking, business) } });
});