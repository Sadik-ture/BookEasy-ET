import Business from "../businesses/business.model.js";
import Favorite from "./favorite.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isOpenNow } from "../../utils/openNow.js";

const fail = (res, status, code, message) =>
  res.status(status).json({ success: false, error: { code, message } });

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

export const listFavorites = asyncHandler(async (req, res) => {
  const saved = await Favorite.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  const ids = saved.map((f) => f.businessId);
  const businesses = await Business.find({ _id: { $in: ids }, status: "approved" })
    .select("name slug category address coverImage logo tags ratingAvg ratingCount openingHours timezone")
    .lean();
  const byId = new Map(businesses.map((b) => [String(b._id), b]));
  const items = ids.map((id) => byId.get(String(id))).filter(Boolean).map(toCard);
  res.json({ success: true, data: { items } });
});

export const saveFavorite = asyncHandler(async (req, res) => {
  const business = await Business.findOne({ _id: req.body.businessId, status: "approved" }).select("_id");
  if (!business) return fail(res, 404, "NOT_FOUND", "That business is not available.");
  try {
    await Favorite.create({ userId: req.user._id, businessId: business._id });
  } catch (err) {
    if (err?.code !== 11000) throw err;
  }
  res.status(201).json({ success: true, data: { saved: true } });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.businessId || "")) {
    return fail(res, 400, "VALIDATION_ERROR", "Invalid selection.");
  }
  await Favorite.deleteOne({ userId: req.user._id, businessId: req.params.businessId });
  res.json({ success: true, data: { saved: false } });
});
