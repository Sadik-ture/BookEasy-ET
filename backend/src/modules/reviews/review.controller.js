import Review from "./review.model.js";
import Booking from "../bookings/booking.model.js";
import Order from "../orders/order.model.js";
import Business from "../businesses/business.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { fail } from "../../utils/http.js";
import { notifyBusiness } from "../notifications/notify.js";

async function refreshRating(businessId) {
  const rows = await Review.aggregate([
    { $match: { businessId, hidden: false } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (!rows.length) return;
  await Business.updateOne(
    { _id: businessId },
    { $set: { ratingAvg: Math.round(rows[0].avg * 10) / 10, ratingCount: rows[0].count } }
  );
}

export const listPublic = asyncHandler(async (req, res) => {
  const slug = String(req.params.slug || "").toLowerCase();
  const business = await Business.findOne({ slug, status: "approved" }).select("_id");
  if (!business) return fail(res, 404, "NOT_FOUND", "Business not found.");
  const items = await Review.find({ businessId: business._id, hidden: false })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("customerId", "fullName")
    .lean();
  res.json({
    success: true,
    data: {
      items: items.map((r) => ({
        id: r._id,
        rating: r.rating,
        comment: r.comment,
        reply: r.reply,
        createdAt: r.createdAt,
        customerName: r.customerId?.fullName || "Customer",
      })),
    },
  });
});

export const eligible = asyncHandler(async (req, res) => {
  const slug = String(req.query.slug || "").toLowerCase();
  const business = await Business.findOne({ slug, status: "approved" }).select("_id name");
  if (!business) return fail(res, 404, "NOT_FOUND", "Business not found.");
  const [bookings, orders, reviews] = await Promise.all([
    Booking.find({ businessId: business._id, customerId: req.user._id, status: "completed" }).select("serviceName startAt"),
    Order.find({ businessId: business._id, customerId: req.user._id, status: "completed" }).select("orderNumber createdAt"),
    Review.find({ businessId: business._id, customerId: req.user._id }).select("bookingId orderId"),
  ]);
  const usedBookings = new Set(reviews.filter((r) => r.bookingId).map((r) => String(r.bookingId)));
  const usedOrders = new Set(reviews.filter((r) => r.orderId).map((r) => String(r.orderId)));
  res.json({
    success: true,
    data: {
      bookings: bookings
        .filter((b) => !usedBookings.has(String(b._id)))
        .map((b) => ({ id: b._id, label: b.serviceName, at: b.startAt })),
      orders: orders
        .filter((o) => !usedOrders.has(String(o._id)))
        .map((o) => ({ id: o._id, label: o.orderNumber, at: o.createdAt })),
    },
  });
});

export const createReview = asyncHandler(async (req, res) => {
  const { bookingId, orderId, rating, comment } = req.body;
  if (!bookingId && !orderId) return fail(res, 400, "VALIDATION_ERROR", "Choose a completed visit to review.");
  let businessId;
  if (bookingId) {
    const booking = await Booking.findOne({ _id: bookingId, customerId: req.user._id, status: "completed" });
    if (!booking) return fail(res, 404, "NOT_FOUND", "That completed booking was not found.");
    businessId = booking.businessId;
  } else {
    const order = await Order.findOne({ _id: orderId, customerId: req.user._id, status: "completed" });
    if (!order) return fail(res, 404, "NOT_FOUND", "That completed order was not found.");
    businessId = order.businessId;
  }
  try {
    const review = await Review.create({
      businessId,
      customerId: req.user._id,
      bookingId: bookingId || undefined,
      orderId: orderId || undefined,
      rating,
      comment: comment || "",
    });
    await refreshRating(businessId);
    await notifyBusiness(businessId, "profile", {
      type: "review",
      title: "New review",
      body: `A customer left a ${rating}-star review.`,
      link: "/workspace/reviews",
    });
    res.status(201).json({ success: true, data: { id: review._id } });
  } catch (err) {
    if (err?.code === 11000) return fail(res, 409, "ALREADY_REVIEWED", "You already reviewed this visit.");
    throw err;
  }
});
