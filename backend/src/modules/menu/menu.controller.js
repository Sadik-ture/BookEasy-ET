import Business from "../businesses/business.model.js";
import MenuCategory from "./menuCategory.model.js";
import MenuItem from "./menuItem.model.js";
import asyncHandler from "../../utils/asyncHandler.js";

// GET /api/v1/businesses/:slug/menu  (public)
export const getMenu = asyncHandler(async (req, res) => {
  const slug = String(req.params.slug || "").toLowerCase();
  const business = /^[a-z0-9-]{1,100}$/.test(slug)
    ? await Business.findOne({ slug, status: "approved", category: "restaurant" }).select("_id").lean()
    : null;

  if (!business) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Menu not found." },
    });
  }

  const [categories, items] = await Promise.all([
    MenuCategory.find({ businessId: business._id, active: true }).sort({ sortOrder: 1, name: 1 }).lean(),
    MenuItem.find({ businessId: business._id, available: true }).sort({ sortOrder: 1, name: 1 }).lean(),
  ]);

  const byCategory = new Map();
  for (const item of items) {
    const key = String(item.categoryId);
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key).push({
      id: item._id,
      name: item.name,
      description: item.description,
      priceMinor: item.priceMinor,
      image: item.image,
    });
  }

  const result = categories
    .map((c) => ({ id: c._id, name: c.name, items: byCategory.get(String(c._id)) || [] }))
    .filter((c) => c.items.length > 0); // hide empty categories

  res.json({ success: true, data: { categories: result } });
});