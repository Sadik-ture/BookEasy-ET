import Business from "./business.model.js";
import Membership from "../memberships/membership.model.js";
import Plan from "../subscriptions/plan.model.js";
import Subscription from "../subscriptions/subscription.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { slugify } from "../../utils/slug.js";
import { fail } from "../../utils/http.js";
import { ensurePlans } from "../subscriptions/defaults.js";

async function uniqueSlug(name) {
  const base = slugify(name);
  let slug = base;
  for (let i = 2; i < 50 && (await Business.exists({ slug })); i++) slug = `${base}-${i}`;
  return slug;
}

function validTimezone(tz) {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const registerBusiness = asyncHandler(async (req, res) => {
  const existing = await Membership.findOne({ userId: req.user._id, role: "owner", status: "active" });
  if (existing) {
    return fail(res, 409, "ALREADY_OWNER", "You already own a business. Use that workspace to manage it.");
  }

  const slug = await uniqueSlug(req.body.name);
  const business = await Business.create({
    ownerId: req.user._id,
    name: req.body.name,
    slug,
    category: req.body.category,
    description: req.body.description || "",
    phone: req.body.phone || "",
    address: req.body.address,
    openingHours: req.body.openingHours,
    status: "pending",
    acceptingRequests: true,
  });

  await Membership.create({
    userId: req.user._id,
    businessId: business._id,
    role: "owner",
    status: "active",
  });

  await ensurePlans();
  const starter = await Plan.findOne({ key: "starter" });
  if (starter) {
    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    await Subscription.create({
      businessId: business._id,
      planId: starter._id,
      status: "trialing",
      startAt,
      endAt,
    });
  }

  res.status(201).json({
    success: true,
    data: {
      business: {
        id: business._id,
        name: business.name,
        slug: business.slug,
        category: business.category,
        status: business.status,
      },
    },
  });
});

export function publicBusiness(business) {
  return {
    id: business._id,
    name: business.name,
    slug: business.slug,
    category: business.category,
    description: business.description,
    phone: business.phone,
    address: business.address,
    coverImage: business.coverImage,
    logo: business.logo,
    gallery: business.gallery || [],
    tags: business.tags,
    openingHours: business.openingHours,
    timezone: business.timezone,
    status: business.status,
    acceptingRequests: business.acceptingRequests !== false,
    bookingSettings: business.bookingSettings,
  };
}

export const updateOwnedBusiness = asyncHandler(async (req, res) => {
  const patch = { ...req.body };
  if (patch.timezone && !validTimezone(patch.timezone)) {
    return fail(res, 400, "VALIDATION_ERROR", "Choose a valid timezone.", { timezone: "Unknown timezone." });
  }
  Object.assign(req.business, patch);
  await req.business.save();
  res.json({ success: true, data: { business: publicBusiness(req.business) } });
});
