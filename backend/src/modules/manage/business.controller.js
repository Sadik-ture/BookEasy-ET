import crypto from "node:crypto";
import Business from "../businesses/business.model.js";
import User from "../users/user.model.js";
import Booking from "../bookings/booking.model.js";
import Order from "../orders/order.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isOpenNow } from "../../utils/openNow.js";
import { todayInZone, addDays, zonedToUtc } from "../../utils/time.js";
import { ACTIVE_ORDER_STATUSES } from "../orders/order.constants.js";

const fail = (res, status, code, message, fields) =>
  res.status(status).json({ success: false, error: { code, message, ...(fields ? { fields } : {}) } });

const slugify = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "business";

const view = (b) => ({
  id: b._id,
  name: b.name,
  slug: b.slug,
  category: b.category,
  status: b.status,
  timezone: b.timezone,
  autoConfirm: Boolean(b.bookingSettings?.autoConfirm),
  isOpen: isOpenNow(b.openingHours, b.timezone),
});

// POST /api/v1/manage/business
export const createBusiness = asyncHandler(async (req, res) => {
  if (await Business.exists({ ownerId: req.user._id })) {
    return fail(res, 409, "ALREADY_OWNER", "You already have a business on BookEasy ET.");
  }

  const b = req.body;
  const openingHours = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    open: b.openTime,
    close: b.closeTime,
    closed: b.closedDays.includes(day),
  }));
  // Development: go live immediately. Production: wait for admin approval (built in Step 8).
  const status = process.env.NODE_ENV === "production" ? "pending" : "approved";

  const base = slugify(b.name);
  let business = null;
  for (let attempt = 0; attempt < 5 && !business; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${crypto.randomBytes(2).toString("hex")}`;
    try {
      business = await Business.create({
        ownerId: req.user._id,
        name: b.name,
        slug,
        category: b.category,
        description: b.description || "",
        phone: b.phone || "",
        address: { line: b.addressLine || "", area: b.area, city: "Addis Ababa" },
        openingHours,
        status,
      });
    } catch (err) {
      if (err?.code !== 11000) throw err;
      if (err.keyPattern?.ownerId) return fail(res, 409, "ALREADY_OWNER", "You already have a business on BookEasy ET.");
      // otherwise the slug was taken: loop and add a suffix
    }
  }
  if (!business) throw new Error("Could not create a unique business address");

  if (req.user.role === "customer") {
    await User.updateOne({ _id: req.user._id }, { $set: { role: "business_owner" } });
  }

  res.status(201).json({ success: true, data: { business: view(business) } });
});

// GET /api/v1/manage/business
export const getMyBusiness = (req, res) => {
  res.json({ success: true, data: { business: view(req.business) } });
};

// PATCH /api/v1/manage/business/settings
export const updateSettings = asyncHandler(async (req, res) => {
  req.business.bookingSettings = { autoConfirm: req.body.autoConfirm };
  await req.business.save();
  res.json({ success: true, data: { autoConfirm: req.business.bookingSettings.autoConfirm } });
});

// GET /api/v1/manage/overview
export const overview = asyncHandler(async (req, res) => {
  const business = req.business;
  const tz = business.timezone;
  const today = todayInZone(tz);
  const start = zonedToUtc(today, 0, tz);
  const end = zonedToUtc(addDays(today, 1), 0, tz);
  const bid = business._id;

  const [pendingBookings, todayBookings, activeOrders, todayOrders, revenue] = await Promise.all([
    Booking.countDocuments({ businessId: bid, status: "pending", startAt: { $gte: start } }),
    Booking.countDocuments({ businessId: bid, status: { $in: ["pending", "confirmed", "completed"] }, startAt: { $gte: start, $lt: end } }),
    Order.countDocuments({ businessId: bid, status: { $in: ACTIVE_ORDER_STATUSES } }),
    Order.countDocuments({ businessId: bid, createdAt: { $gte: start, $lt: end }, status: { $nin: ["cancelled", "rejected"] } }),
    Order.aggregate([
      { $match: { businessId: bid, status: "completed", updatedAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$totalMinor" } } },
    ]),
  ]);

  res.json({
    success: true,
    data: { pendingBookings, todayBookings, activeOrders, todayOrders, todayRevenueMinor: revenue[0]?.total || 0 },
  });
});