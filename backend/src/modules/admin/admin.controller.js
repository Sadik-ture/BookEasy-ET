import User from "../users/user.model.js";
import Business from "../businesses/business.model.js";
import Order from "../orders/order.model.js";
import Booking from "../bookings/booking.model.js";
import Plan from "../subscriptions/plan.model.js";
import Subscription from "../subscriptions/subscription.model.js";
import Review from "../reviews/review.model.js";
import AuditLog from "../audit/audit.model.js";
import PlatformSetting from "./setting.model.js";
import Membership from "../memberships/membership.model.js";
import { CATEGORIES } from "../businesses/business.constants.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { fail } from "../../utils/http.js";
import { writeAudit } from "../audit/audit.service.js";
import { notifyUser } from "../notifications/notify.js";

export const metrics = asyncHandler(async (req, res) => {
  const [users, businesses, pending, orders, bookings] = await Promise.all([
    User.countDocuments(),
    Business.countDocuments({ status: "approved" }),
    Business.countDocuments({ status: "pending" }),
    Order.countDocuments(),
    Booking.countDocuments(),
  ]);
  res.json({ success: true, data: { users, approvedBusinesses: businesses, pendingBusinesses: pending, orders, bookings } });
});

export const listBusinesses = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const items = await Business.find(filter).sort({ createdAt: -1 }).limit(100).select("name slug category status phone address createdAt");
  res.json({ success: true, data: { items } });
});

export const setBusinessStatus = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) return fail(res, 404, "NOT_FOUND", "Business not found.");
  const allowed = ["pending", "approved", "rejected", "suspended"];
  if (!allowed.includes(req.body.status)) return fail(res, 400, "VALIDATION_ERROR", "Unknown status.");
  business.status = req.body.status;
  await business.save();
  await writeAudit({
    actorId: req.user._id,
    businessId: business._id,
    action: "business.status",
    targetType: "business",
    targetId: String(business._id),
    meta: { status: business.status },
  });
  const owners = await Membership.find({ businessId: business._id, role: "owner", status: "active" });
  await Promise.all(
    owners.map((m) =>
      notifyUser({
        userId: m.userId,
        businessId: business._id,
        type: "business",
        title: `Business ${business.status}`,
        body: `${business.name} is now ${business.status}.`,
        link: "/workspace",
      })
    )
  );
  res.json({ success: true, data: { id: business._id, status: business.status } });
});

export const listUsers = asyncHandler(async (req, res) => {
  const items = await User.find().sort({ createdAt: -1 }).limit(100).select("fullName email phone role status createdAt");
  res.json({ success: true, data: { items } });
});

export const setUserStatus = asyncHandler(async (req, res) => {
  if (!["active", "suspended"].includes(req.body.status)) return fail(res, 400, "VALIDATION_ERROR", "Unknown status.");
  const user = await User.findById(req.params.id);
  if (!user) return fail(res, 404, "NOT_FOUND", "User not found.");
  if (String(user._id) === String(req.user._id)) return fail(res, 400, "FORBIDDEN", "You cannot change your own status.");
  user.status = req.body.status;
  await user.save();
  await writeAudit({
    actorId: req.user._id,
    action: "user.status",
    targetType: "user",
    targetId: String(user._id),
    meta: { status: user.status },
  });
  res.json({ success: true, data: { id: user._id, status: user.status } });
});

export const setUserRole = asyncHandler(async (req, res) => {
  if (req.user.role !== "super_admin") return fail(res, 403, "FORBIDDEN", "Only a super admin can change platform roles.");
  if (!["customer", "support_admin", "super_admin"].includes(req.body.role)) {
    return fail(res, 400, "VALIDATION_ERROR", "Unknown role.");
  }
  const user = await User.findById(req.params.id);
  if (!user) return fail(res, 404, "NOT_FOUND", "User not found.");
  user.role = req.body.role;
  await user.save();
  await writeAudit({
    actorId: req.user._id,
    action: "user.role",
    targetType: "user",
    targetId: String(user._id),
    meta: { role: user.role },
  });
  res.json({ success: true, data: { id: user._id, role: user.role } });
});

export const listPlans = asyncHandler(async (req, res) => {
  const items = await Plan.find().sort({ monthlyPriceMinor: 1 });
  res.json({ success: true, data: { items } });
});

export const assignSubscription = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.body.planId);
  const business = await Business.findById(req.body.businessId);
  if (!plan || !business) return fail(res, 404, "NOT_FOUND", "Plan or business not found.");
  const months = Number(req.body.months) || 1;
  if (months < 1 || months > 24) return fail(res, 400, "VALIDATION_ERROR", "Choose between 1 and 24 months.");
  const startAt = new Date();
  const endAt = new Date(startAt);
  endAt.setMonth(endAt.getMonth() + months);
  const sub = await Subscription.findOneAndUpdate(
    { businessId: business._id },
    { planId: plan._id, status: "active", startAt, endAt, activatedBy: req.user._id },
    { new: true, upsert: true }
  );
  await writeAudit({
    actorId: req.user._id,
    businessId: business._id,
    action: "subscription.assign",
    targetType: "subscription",
    targetId: String(sub._id),
    meta: { plan: plan.key, months },
  });
  res.json({ success: true, data: { id: sub._id, status: sub.status, endAt: sub.endAt } });
});

export const listReviews = asyncHandler(async (req, res) => {
  const items = await Review.find().sort({ createdAt: -1 }).limit(50).populate("businessId", "name").lean();
  res.json({ success: true, data: { items } });
});

export const moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return fail(res, 404, "NOT_FOUND", "Review not found.");
  review.hidden = Boolean(req.body.hidden);
  await review.save();
  await writeAudit({
    actorId: req.user._id,
    businessId: review.businessId,
    action: "review.moderate",
    targetType: "review",
    targetId: String(review._id),
    meta: { hidden: review.hidden },
  });
  res.json({ success: true, data: { id: review._id, hidden: review.hidden } });
});

export const listCategories = asyncHandler(async (req, res) => {
  const setting = await PlatformSetting.findOne({ key: "categoryLabels" });
  const labels = setting?.value || {};
  res.json({
    success: true,
    data: { categories: CATEGORIES.map((c) => ({ key: c.key, label: labels[c.key] || c.label })) },
  });
});

export const updateCategories = asyncHandler(async (req, res) => {
  const labels = {};
  for (const c of CATEGORIES) {
    const next = req.body.labels?.[c.key];
    if (typeof next === "string" && next.trim()) labels[c.key] = next.trim().slice(0, 40);
  }
  await PlatformSetting.updateOne({ key: "categoryLabels" }, { $set: { value: labels } }, { upsert: true });
  await writeAudit({
    actorId: req.user._id,
    action: "categories.update",
    targetType: "setting",
    targetId: "categoryLabels",
  });
  res.json({ success: true, data: { labels } });
});

export const listAudit = asyncHandler(async (req, res) => {
  const items = await AuditLog.find().sort({ createdAt: -1 }).limit(80).lean();
  res.json({ success: true, data: { items } });
});
