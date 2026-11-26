import Business from "../businesses/business.model.js";
import Service from "../services/service.model.js";
import Staff from "../staff/staff.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { getDayAvailability } from "./availability.service.js";
import { BOOKABLE_CATEGORIES } from "./booking.constants.js";

const notFound = (res) =>
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Not found." },
  });

async function findBookableBusiness(slug) {
  const clean = String(slug || "").toLowerCase();
  if (!/^[a-z0-9-]{1,100}$/.test(clean)) return null;
  return Business.findOne({ slug: clean, status: "approved", category: { $in: BOOKABLE_CATEGORIES } });
}

// GET /api/v1/businesses/:slug/services
export const listServices = asyncHandler(async (req, res) => {
  const business = await findBookableBusiness(req.params.slug);
  if (!business) return notFound(res);

  const items = await Service.find({ businessId: business._id, active: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  res.json({
    success: true,
    data: {
      items: items.map((s) => ({
        id: s._id,
        name: s.name,
        description: s.description,
        priceMinor: s.priceMinor,
        durationMinutes: s.durationMinutes,
      })),
    },
  });
});

// GET /api/v1/businesses/:slug/staff
export const listStaff = asyncHandler(async (req, res) => {
  const business = await findBookableBusiness(req.params.slug);
  if (!business) return notFound(res);

  const items = await Staff.find({ businessId: business._id, active: true }).sort({ name: 1 }).lean();

  res.json({
    success: true,
    data: {
      items: items.map((s) => ({
        id: s._id,
        name: s.name,
        title: s.title,
        avatar: s.avatar,
        serviceIds: s.serviceIds.map(String),
      })),
    },
  });
});

// GET /api/v1/businesses/:slug/availability?serviceId=&date=&staffId=
export const getAvailability = asyncHandler(async (req, res) => {
  const { serviceId, date, staffId } = req.validatedQuery;

  const business = await findBookableBusiness(req.params.slug);
  if (!business) return notFound(res);

  const service = await Service.findOne({ _id: serviceId, businessId: business._id, active: true });
  if (!service) return notFound(res);

  const day = await getDayAvailability({ business, service, date, staffId: staffId || null });

  res.json({
    success: true,
    data: {
      date,
      timezone: business.timezone,
      message: day.message,
      slots: day.times.map((t) => ({ time: t.time, startAt: t.startAt })),
    },
  });
});