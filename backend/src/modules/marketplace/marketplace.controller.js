import Business from "../businesses/business.model.js";
import { CATEGORIES } from "../businesses/business.constants.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isOpenNow } from "../../utils/openNow.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const LIST_FIELDS =
  "name slug category address coverImage logo tags ratingAvg ratingCount openingHours timezone";

const toCard = (b) => ({
  id: b._id,
  name: b.name,
  slug: b.slug,
  category: b.category,
  address: b.address,
  coverImage: b.coverImage,
  logo: b.logo,
  tags: b.tags,
  ratingAvg: b.ratingAvg,
  ratingCount: b.ratingCount,
  isOpen: isOpenNow(b.openingHours, b.timezone),
});

const SORTS = {
  popular: { ratingCount: -1, ratingAvg: -1, _id: 1 },
  rating: { ratingAvg: -1, ratingCount: -1, _id: 1 },
  newest: { createdAt: -1, _id: 1 },
};

// GET /api/v1/businesses
export const listBusinesses = asyncHandler(async (req, res) => {
  const { category, search, sort, page, limit } = req.validatedQuery;

  const filter = { status: "approved" }; // only approved businesses are public
  if (category) filter.category = category;
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: rx }, { tags: rx }, { "address.area": rx }, { description: rx }];
  }

  const [items, total] = await Promise.all([
    Business.find(filter)
      .select(LIST_FIELDS)
      .sort(SORTS[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Business.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { items: items.map(toCard) },
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/v1/businesses/:slug
export const getBusiness = asyncHandler(async (req, res) => {
  const slug = String(req.params.slug || "").toLowerCase();
  const business = /^[a-z0-9-]{1,100}$/.test(slug)
    ? await Business.findOne({ slug, status: "approved" })
        .select("-ownerId -status -__v")
        .lean()
    : null;

  if (!business) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Business not found." },
    });
  }

  const { _id, ...rest } = business;
  res.json({
    success: true,
    data: { business: { id: _id, ...rest, isOpen: isOpenNow(business.openingHours, business.timezone) } },
  });
});

// GET /api/v1/categories
export const listCategories = asyncHandler(async (req, res) => {
  const rows = await Business.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(rows.map((r) => [r._id, r.count]));

  res.json({
    success: true,
    data: { categories: CATEGORIES.map((c) => ({ ...c, count: counts[c.key] || 0 })) },
  });
});