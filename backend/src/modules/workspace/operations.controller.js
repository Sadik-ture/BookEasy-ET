import crypto from "node:crypto";
import QRCode from "qrcode";
import Booking from "../bookings/booking.model.js";
import BookingSlot from "../bookings/bookingSlot.model.js";
import Staff from "../staff/staff.model.js";
import Order from "../orders/order.model.js";
import RestaurantTable from "../tables/table.model.js";
import Review from "../reviews/review.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { fail } from "../../utils/http.js";
import { canTransitionBooking, ACTIVE_STATUSES } from "../bookings/booking.constants.js";
import { canTransitionOrder } from "../orders/order.constants.js";
import { hasPermission } from "../memberships/permissions.js";
import { notifyUser } from "../notifications/notify.js";
import { assertWithinLimit, loadSubscription } from "../subscriptions/limits.js";
import { todayInZone, addDays, zonedToUtc } from "../../utils/time.js";

const bookingView = (b) => ({
  id: b._id,
  status: b.status,
  startAt: b.startAt,
  endAt: b.endAt,
  serviceName: b.serviceName,
  staffName: b.staffName,
  staffId: b.staffId,
  durationMinutes: b.durationMinutes,
  priceMinor: b.priceMinor,
  currency: b.currency,
  customerNotes: b.customerNotes,
  customerId: b.customerId?._id || b.customerId,
  customerName: b.customerId?.fullName || "",
  customerPhone: b.customerId?.phone || "",
});

async function assignedStaffIds(req) {
  if (req.membership.role !== "staff") return null;
  const rows = await Staff.find({ businessId: req.business._id, userId: req.user._id }).select("_id");
  return rows.map((s) => s._id);
}

export const dashboard = asyncHandler(async (req, res) => {
  const tz = req.business.timezone || "Africa/Addis_Ababa";
  const today = todayInZone(tz);
  const start = zonedToUtc(today, 0, tz);
  const end = zonedToUtc(addDays(today, 1), 0, tz);
  const businessId = req.business._id;
  const [bookingsToday, pendingBookings, ordersToday, pendingOrders] = await Promise.all([
    Booking.countDocuments({ businessId, startAt: { $gte: start, $lt: end }, status: { $in: ACTIVE_STATUSES } }),
    Booking.countDocuments({ businessId, status: "pending" }),
    Order.countDocuments({ businessId, createdAt: { $gte: start, $lt: end }, status: { $nin: ["cancelled", "rejected"] } }),
    Order.countDocuments({ businessId, status: "pending" }),
  ]);
  res.json({
    success: true,
    data: {
      business: { id: businessId, name: req.business.name, status: req.business.status, category: req.business.category },
      bookingsToday,
      pendingBookings,
      ordersToday,
      pendingOrders,
    },
  });
});

export const listBookings = asyncHandler(async (req, res) => {
  const filter = { businessId: req.business._id };
  const assigned = await assignedStaffIds(req);
  if (assigned) filter.staffId = { $in: assigned };
  if (req.query.scope === "upcoming") {
    filter.status = { $in: ACTIVE_STATUSES };
    filter.startAt = { $gte: new Date() };
  }
  const items = await Booking.find(filter).sort({ startAt: 1 }).limit(100).populate("customerId", "fullName phone");
  res.json({ success: true, data: { items: items.map(bookingView) } });
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, businessId: req.business._id });
  if (!booking) return fail(res, 404, "NOT_FOUND", "Booking not found.");
  const next = req.body.status;
  if (!canTransitionBooking(booking.status, next)) {
    return fail(res, 409, "INVALID_STATUS", "That status change is not allowed.");
  }
  if (req.membership.role === "staff") {
    const mine = await Staff.exists({ _id: booking.staffId, businessId: req.business._id, userId: req.user._id });
    if (!mine) return fail(res, 403, "FORBIDDEN", "You can update only your own appointments.");
  }
  booking.status = next;
  if (next === "cancelled" || next === "rejected") {
    booking.cancelledAt = new Date();
    booking.cancelledBy = "business";
    await BookingSlot.deleteMany({ bookingId: booking._id });
  }
  await booking.save();
  await notifyUser({
    userId: booking.customerId,
    businessId: req.business._id,
    type: "booking",
    title: `Booking ${next}`,
    body: `${booking.serviceName} at ${req.business.name} is now ${next}.`,
    link: "/my-bookings",
  });
  res.json({ success: true, data: { id: booking._id, status: booking.status } });
});

const orderView = (o) => ({
  id: o._id,
  orderNumber: o.orderNumber,
  type: o.type,
  status: o.status,
  items: o.items,
  totalMinor: o.totalMinor,
  currency: o.currency,
  phone: o.phone,
  notes: o.notes,
  tableLabel: o.tableLabel || "",
  estimatedReadyAt: o.estimatedReadyAt,
  customerName: o.customerName,
  createdAt: o.createdAt,
});

export const listOrders = asyncHandler(async (req, res) => {
  const filter = { businessId: req.business._id };
  if (req.query.scope === "active") {
    filter.status = { $in: ["pending", "accepted", "preparing", "ready"] };
  }
  const items = await Order.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data: { items: items.map(orderView) } });
});

function orderChangeAllowed(membership, from, to) {
  if (!canTransitionOrder(from, to)) return false;
  if (to === "cancelled") return hasPermission(membership, "orders") && !["kitchen", "staff"].includes(membership.role);
  if (from === "pending") return hasPermission(membership, "orders") && membership.role !== "kitchen";
  return hasPermission(membership, "kitchen");
}

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, businessId: req.business._id });
  if (!order) return fail(res, 404, "NOT_FOUND", "Order not found.");
  const next = req.body.status;
  if (!orderChangeAllowed(req.membership, order.status, next)) {
    return fail(res, 409, "INVALID_STATUS", "That status change is not allowed for your role.");
  }
  if (next === "accepted" && !req.body.estimatedMinutes) {
    return fail(res, 400, "VALIDATION_ERROR", "Add a preparation estimate.", {
      estimatedMinutes: "Enter how many minutes the kitchen needs.",
    });
  }
  order.status = next;
  if (next === "accepted") order.estimatedReadyAt = new Date(Date.now() + req.body.estimatedMinutes * 60_000);
  if (next === "cancelled") {
    order.cancelledAt = new Date();
    order.cancelledBy = "business";
  }
  order.statusHistory.push({ status: next, at: new Date(), by: req.user._id });
  await order.save();
  const ready = order.estimatedReadyAt ? ` Ready around ${order.estimatedReadyAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.` : "";
  await notifyUser({
    userId: order.customerId,
    businessId: req.business._id,
    type: "order",
    title: `Order ${order.orderNumber} ${next}`,
    body: `${req.business.name} updated your order to ${next}.${ready}`,
    link: "/my-orders",
  });
  res.json({ success: true, data: { order: orderView(order) } });
});

export const listTables = asyncHandler(async (req, res) => {
  const items = await RestaurantTable.find({ businessId: req.business._id }).sort({ label: 1 }).lean();
  res.json({
    success: true,
    data: {
      items: items.map((t) => ({
        id: t._id,
        label: t.label,
        active: t.active,
        path: `/t/${t.qrToken}`,
      })),
    },
  });
});

export const createTable = asyncHandler(async (req, res) => {
  if (req.business.category !== "restaurant") return fail(res, 400, "NOT_RESTAURANT", "Tables are for restaurants.");
  const count = await RestaurantTable.countDocuments({ businessId: req.business._id, active: true });
  if (!(await assertWithinLimit(res, req.business._id, "maxTables", count))) return;
  const table = await RestaurantTable.create({
    businessId: req.business._id,
    label: req.body.label,
    qrToken: crypto.randomBytes(24).toString("hex"),
  });
  res.status(201).json({ success: true, data: { id: table._id, label: table.label, path: `/t/${table.qrToken}` } });
});

export const rotateQr = asyncHandler(async (req, res) => {
  const table = await RestaurantTable.findOne({ _id: req.params.id, businessId: req.business._id });
  if (!table) return fail(res, 404, "NOT_FOUND", "Table not found.");
  table.qrToken = crypto.randomBytes(24).toString("hex");
  table.active = true;
  await table.save();
  res.json({ success: true, data: { id: table._id, path: `/t/${table.qrToken}` } });
});

export const tableQrPng = asyncHandler(async (req, res) => {
  const table = await RestaurantTable.findOne({ _id: req.params.id, businessId: req.business._id });
  if (!table) return fail(res, 404, "NOT_FOUND", "Table not found.");
  const url = `${process.env.APP_URL || "http://localhost:5173"}/t/${table.qrToken}`;
  const png = await QRCode.toBuffer(url, { width: 480, margin: 1 });
  res.set("Content-Type", "image/png");
  res.send(png);
});

export const reports = asyncHandler(async (req, res) => {
  const access = await loadSubscription(req.business._id);
  if (!access.reports) {
    return fail(res, 403, "PLAN_LIMIT", "Detailed reports are included on the Professional and Premium plans.");
  }
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const businessId = req.business._id;
  const [orderAgg, bookingCount] = await Promise.all([
    Order.aggregate([
      { $match: { businessId, createdAt: { $gte: since }, status: "completed" } },
      { $group: { _id: null, revenueMinor: { $sum: "$totalMinor" }, orders: { $sum: 1 } } },
    ]),
    Booking.countDocuments({ businessId, createdAt: { $gte: since }, status: "completed" }),
  ]);
  const top = await Order.aggregate([
    { $match: { businessId, createdAt: { $gte: since }, status: { $nin: ["cancelled", "rejected"] } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
    { $sort: { quantity: -1 } },
    { $limit: 5 },
  ]);
  res.json({
    success: true,
    data: {
      days: 30,
      completedOrders: orderAgg[0]?.orders || 0,
      revenueMinor: orderAgg[0]?.revenueMinor || 0,
      completedBookings: bookingCount,
      topItems: top.map((t) => ({ name: t._id, quantity: t.quantity })),
    },
  });
});

export const subscription = asyncHandler(async (req, res) => {
  const access = await loadSubscription(req.business._id);
  res.json({
    success: true,
    data: {
      status: access.sub?.status || "none",
      startAt: access.sub?.startAt || null,
      endAt: access.sub?.endAt || null,
      plan: access.sub?.planId
        ? {
            key: access.sub.planId.key,
            name: access.sub.planId.name,
            monthlyPriceMinor: access.sub.planId.monthlyPriceMinor,
            limits: access.limits,
          }
        : { name: "Starter defaults", limits: access.limits },
    },
  });
});

export const replyToReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, businessId: req.business._id, hidden: false });
  if (!review) return fail(res, 404, "NOT_FOUND", "Review not found.");
  review.reply = req.body.reply;
  review.repliedAt = new Date();
  await review.save();
  res.json({ success: true, data: { id: review._id, reply: review.reply } });
});

export const listBusinessReviews = asyncHandler(async (req, res) => {
  const items = await Review.find({ businessId: req.business._id }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ success: true, data: { items } });
});
