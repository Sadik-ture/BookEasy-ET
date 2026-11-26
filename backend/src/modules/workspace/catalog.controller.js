import Service from "../services/service.model.js";
import Staff from "../staff/staff.model.js";
import MenuCategory from "../menu/menuCategory.model.js";
import MenuItem from "../menu/menuItem.model.js";
import Membership from "../memberships/membership.model.js";
import User from "../users/user.model.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../../utils/asyncHandler.js";
import { fail } from "../../utils/http.js";
import { publicUploadPath } from "../../middleware/upload.js";
import { assertWithinLimit, loadSubscription } from "../subscriptions/limits.js";
import { permissionsFor } from "../memberships/permissions.js";
import { makeSecretToken } from "../../utils/tokens.js";
import { sendMail } from "../../utils/mailer.js";
import { writeAudit } from "../audit/audit.service.js";
import { publicBusiness } from "../businesses/business.controller.js";

async function servicesBelong(businessId, ids) {
  if (!ids?.length) return true;
  const count = await Service.countDocuments({ _id: { $in: ids }, businessId, active: true });
  return count === ids.length;
}

export const getProfile = (req, res) => {
  res.json({ success: true, data: { business: publicBusiness(req.business) } });
};

export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 400, "UPLOAD_ERROR", "Choose an image.");
  req.business.logo = publicUploadPath(req.file);
  await req.business.save();
  res.json({ success: true, data: { logo: req.business.logo } });
});

export const uploadCover = asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 400, "UPLOAD_ERROR", "Choose an image.");
  req.business.coverImage = publicUploadPath(req.file);
  await req.business.save();
  res.json({ success: true, data: { coverImage: req.business.coverImage } });
});

export const uploadGallery = asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 400, "UPLOAD_ERROR", "Choose an image.");
  req.business.gallery = [...(req.business.gallery || []), publicUploadPath(req.file)].slice(-8);
  await req.business.save();
  res.json({ success: true, data: { gallery: req.business.gallery } });
});

export const listServices = asyncHandler(async (req, res) => {
  const items = await Service.find({ businessId: req.business._id }).sort({ sortOrder: 1, name: 1 }).lean();
  res.json({ success: true, data: { items } });
});

export const createService = asyncHandler(async (req, res) => {
  const service = await Service.create({ ...req.body, businessId: req.business._id });
  res.status(201).json({ success: true, data: { service } });
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findOneAndUpdate(
    { _id: req.params.id, businessId: req.business._id },
    req.body,
    { new: true }
  );
  if (!service) return fail(res, 404, "NOT_FOUND", "Service not found.");
  res.json({ success: true, data: { service } });
});

export const listStaff = asyncHandler(async (req, res) => {
  const items = await Staff.find({ businessId: req.business._id }).sort({ name: 1 }).lean();
  res.json({ success: true, data: { items } });
});

export const createStaff = asyncHandler(async (req, res) => {
  const count = await Staff.countDocuments({ businessId: req.business._id, active: true });
  if (!(await assertWithinLimit(res, req.business._id, "maxStaff", count))) return;
  if (!(await servicesBelong(req.business._id, req.body.serviceIds))) {
    return fail(res, 400, "VALIDATION_ERROR", "Choose services from this business.", { serviceIds: "Unknown service." });
  }
  if (req.body.userId) {
    const member = await Membership.exists({
      userId: req.body.userId,
      businessId: req.business._id,
      status: "active",
    });
    if (!member) return fail(res, 400, "VALIDATION_ERROR", "That user is not on this team.", { userId: "Unknown teammate." });
  }
  const staff = await Staff.create({ ...req.body, businessId: req.business._id });
  res.status(201).json({ success: true, data: { staff } });
});

export const updateStaff = asyncHandler(async (req, res) => {
  if (req.body.serviceIds && !(await servicesBelong(req.business._id, req.body.serviceIds))) {
    return fail(res, 400, "VALIDATION_ERROR", "Choose services from this business.", { serviceIds: "Unknown service." });
  }
  const staff = await Staff.findOneAndUpdate(
    { _id: req.params.id, businessId: req.business._id },
    req.body,
    { new: true }
  );
  if (!staff) return fail(res, 404, "NOT_FOUND", "Staff member not found.");
  res.json({ success: true, data: { staff } });
});

export const listTeam = asyncHandler(async (req, res) => {
  const rows = await Membership.find({ businessId: req.business._id }).populate("userId", "fullName email phone status");
  res.json({
    success: true,
    data: {
      items: rows.map((m) => ({
        id: m._id,
        role: m.role,
        status: m.status,
        permissions: permissionsFor(m),
        user: m.userId
          ? { id: m.userId._id, fullName: m.userId.fullName, email: m.userId.email, phone: m.userId.phone }
          : null,
      })),
    },
  });
});

export const inviteMember = asyncHandler(async (req, res) => {
  const { fullName, email, role } = req.body;
  let user = await User.findOne({ email });
  let inviteUrl = "";
  if (!user) {
    const { raw, hash } = makeSecretToken();
    user = await User.create({
      fullName,
      email,
      passwordHash: await bcrypt.hash(raw, 12),
      resetTokenHash: hash,
      resetTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    inviteUrl = `${process.env.APP_URL || "http://localhost:5173"}/reset-password?token=${raw}`;
    await sendMail({
      to: email,
      subject: `You are invited to ${req.business.name} on BookEasy ET`,
      text: `Set your password with this link (valid for 7 days):\n${inviteUrl}`,
    });
  }

  const already = await Membership.findOne({ userId: user._id, businessId: req.business._id });
  if (already && already.status === "active") {
    return fail(res, 409, "ALREADY_MEMBER", "That person is already on this team.");
  }
  const membership = already
    ? await Membership.findByIdAndUpdate(already._id, { role, status: "active" }, { new: true })
    : await Membership.create({ userId: user._id, businessId: req.business._id, role, status: "active" });

  if (role === "staff") {
    const linked = await Staff.findOne({ businessId: req.business._id, userId: user._id });
    if (!linked) {
      const count = await Staff.countDocuments({ businessId: req.business._id, active: true });
      const access = await loadSubscription(req.business._id);
      if (access.active && count < access.limits.maxStaff) {
        await Staff.create({ businessId: req.business._id, userId: user._id, name: user.fullName, title: "Staff" });
      }
    }
  }

  await writeAudit({
    actorId: req.user._id,
    businessId: req.business._id,
    action: "team.invite",
    targetType: "membership",
    targetId: String(membership._id),
    meta: { role, email },
  });

  res.status(201).json({
    success: true,
    data: { membershipId: membership._id, inviteUrl },
  });
});

export const updateMember = asyncHandler(async (req, res) => {
  const membership = await Membership.findOne({ _id: req.params.id, businessId: req.business._id });
  if (!membership) return fail(res, 404, "NOT_FOUND", "Team member not found.");
  if (membership.role === "owner") return fail(res, 403, "FORBIDDEN", "The owner membership cannot be changed here.");
  if (req.body.role) membership.role = req.body.role;
  if (req.body.status) membership.status = req.body.status;
  await membership.save();
  await writeAudit({
    actorId: req.user._id,
    businessId: req.business._id,
    action: "team.update",
    targetType: "membership",
    targetId: String(membership._id),
    meta: { role: membership.role, status: membership.status },
  });
  res.json({ success: true, data: { id: membership._id, role: membership.role, status: membership.status } });
});

export const listCategories = asyncHandler(async (req, res) => {
  const items = await MenuCategory.find({ businessId: req.business._id }).sort({ sortOrder: 1, name: 1 }).lean();
  res.json({ success: true, data: { items } });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await MenuCategory.create({ ...req.body, businessId: req.business._id });
  res.status(201).json({ success: true, data: { category } });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await MenuCategory.findOneAndUpdate(
    { _id: req.params.id, businessId: req.business._id },
    req.body,
    { new: true }
  );
  if (!category) return fail(res, 404, "NOT_FOUND", "Category not found.");
  res.json({ success: true, data: { category } });
});

export const listMenuItems = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({ businessId: req.business._id }).sort({ sortOrder: 1, name: 1 }).lean();
  res.json({ success: true, data: { items } });
});

export const createMenuItem = asyncHandler(async (req, res) => {
  const count = await MenuItem.countDocuments({ businessId: req.business._id });
  if (!(await assertWithinLimit(res, req.business._id, "maxMenuItems", count))) return;
  const category = await MenuCategory.findOne({ _id: req.body.categoryId, businessId: req.business._id });
  if (!category) return fail(res, 404, "NOT_FOUND", "Menu category not found.");
  const item = await MenuItem.create({ ...req.body, businessId: req.business._id });
  res.status(201).json({ success: true, data: { item } });
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  if (req.body.categoryId) {
    const category = await MenuCategory.findOne({ _id: req.body.categoryId, businessId: req.business._id });
    if (!category) return fail(res, 404, "NOT_FOUND", "Menu category not found.");
  }
  const item = await MenuItem.findOneAndUpdate(
    { _id: req.params.id, businessId: req.business._id },
    req.body,
    { new: true }
  );
  if (!item) return fail(res, 404, "NOT_FOUND", "Menu item not found.");
  res.json({ success: true, data: { item } });
});

export const uploadMenuImage = asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 400, "UPLOAD_ERROR", "Choose an image.");
  const item = await MenuItem.findOneAndUpdate(
    { _id: req.params.id, businessId: req.business._id },
    { image: publicUploadPath(req.file) },
    { new: true }
  );
  if (!item) return fail(res, 404, "NOT_FOUND", "Menu item not found.");
  res.json({ success: true, data: { image: item.image } });
});
