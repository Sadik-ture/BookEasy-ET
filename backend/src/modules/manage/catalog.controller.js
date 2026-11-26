import Service from "../services/service.model.js";
import Staff from "../staff/staff.model.js";
import asyncHandler from "../../utils/asyncHandler.js";

const fail = (res, status, code, message, fields) =>
  res.status(status).json({ success: false, error: { code, message, ...(fields ? { fields } : {}) } });
const isDup = (e) => e?.code === 11000;
const dupName = (res) =>
  fail(res, 409, "DUPLICATE", "Please review the submitted information.", { name: "You already have one with this name." });
const validId = (id) => /^[a-f\d]{24}$/i.test(id);

const serviceView = (s) => ({
  id: s._id,
  name: s.name,
  description: s.description,
  priceMinor: s.priceMinor,
  durationMinutes: s.durationMinutes,
  active: s.active,
});
const staffView = (s) => ({
  id: s._id,
  name: s.name,
  title: s.title,
  active: s.active,
  serviceIds: s.serviceIds.map(String),
});

// Every service id must belong to THIS business
async function ownsServices(businessId, ids) {
  if (!ids.length) return true;
  const unique = [...new Set(ids)];
  return (await Service.countDocuments({ _id: { $in: unique }, businessId })) === unique.length;
}

// ----- Services -----
export const listServices = asyncHandler(async (req, res) => {
  const items = await Service.find({ businessId: req.business._id }).sort({ sortOrder: 1, name: 1 }).lean();
  res.json({ success: true, data: { items: items.map(serviceView) } });
});

export const createService = asyncHandler(async (req, res) => {
  const { name, description, priceBirr, durationMinutes } = req.body;
  const count = await Service.countDocuments({ businessId: req.business._id });
  try {
    const s = await Service.create({
      businessId: req.business._id,
      name,
      description: description || "",
      priceMinor: Math.round(priceBirr * 100),
      durationMinutes,
      sortOrder: count,
    });
    res.status(201).json({ success: true, data: { id: s._id } });
  } catch (err) {
    if (isDup(err)) return dupName(res);
    throw err;
  }
});

export const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) return fail(res, 404, "NOT_FOUND", "Service not found.");
  const { name, description, priceBirr, durationMinutes, active } = req.body;
  const set = {};
  if (name !== undefined) set.name = name;
  if (description !== undefined) set.description = description;
  if (priceBirr !== undefined) set.priceMinor = Math.round(priceBirr * 100);
  if (durationMinutes !== undefined) set.durationMinutes = durationMinutes;
  if (active !== undefined) set.active = active;
  try {
    const s = await Service.findOneAndUpdate({ _id: id, businessId: req.business._id }, { $set: set }, { new: true, runValidators: true });
    if (!s) return fail(res, 404, "NOT_FOUND", "Service not found.");
    res.json({ success: true, data: { id: s._id } });
  } catch (err) {
    if (isDup(err)) return dupName(res);
    throw err;
  }
});

// ----- Staff -----
export const listStaff = asyncHandler(async (req, res) => {
  const items = await Staff.find({ businessId: req.business._id }).sort({ name: 1 }).lean();
  res.json({ success: true, data: { items: items.map(staffView) } });
});

export const createStaff = asyncHandler(async (req, res) => {
  const { name, title, serviceIds } = req.body;
  if (!(await ownsServices(req.business._id, serviceIds))) return fail(res, 404, "NOT_FOUND", "Service not found.");
  try {
    // No custom shifts: staff follow the business opening hours
    const s = await Staff.create({ businessId: req.business._id, name, title: title || "", serviceIds });
    res.status(201).json({ success: true, data: { id: s._id } });
  } catch (err) {
    if (isDup(err)) return dupName(res);
    throw err;
  }
});

export const updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) return fail(res, 404, "NOT_FOUND", "Staff member not found.");
  const { name, title, serviceIds, active } = req.body;
  const set = {};
  if (name !== undefined) set.name = name;
  if (title !== undefined) set.title = title;
  if (active !== undefined) set.active = active;
  if (serviceIds !== undefined) {
    if (!(await ownsServices(req.business._id, serviceIds))) return fail(res, 404, "NOT_FOUND", "Service not found.");
    set.serviceIds = serviceIds;
  }
  try {
    const s = await Staff.findOneAndUpdate({ _id: id, businessId: req.business._id }, { $set: set }, { new: true, runValidators: true });
    if (!s) return fail(res, 404, "NOT_FOUND", "Staff member not found.");
    res.json({ success: true, data: { id: s._id } });
  } catch (err) {
    if (isDup(err)) return dupName(res);
    throw err;
  }
});