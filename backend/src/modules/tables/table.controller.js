import Business from "../businesses/business.model.js";
import RestaurantTable from "./table.model.js";
import MenuCategory from "../menu/menuCategory.model.js";
import MenuItem from "../menu/menuItem.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { fail } from "../../utils/http.js";

export const resolveTable = asyncHandler(async (req, res) => {
  const token = String(req.params.qrToken || "");
  if (!/^[a-f0-9]{32,128}$/i.test(token)) return fail(res, 404, "NOT_FOUND", "Table not found.");
  const table = await RestaurantTable.findOne({ qrToken: token, active: true });
  if (!table) return fail(res, 404, "NOT_FOUND", "This table code is not active.");
  const business = await Business.findOne({ _id: table.businessId, status: "approved", category: "restaurant" });
  if (!business) return fail(res, 404, "NOT_FOUND", "Restaurant not found.");

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

  res.json({
    success: true,
    data: {
      table: { id: table._id, label: table.label },
      business: {
        id: business._id,
        name: business.name,
        slug: business.slug,
        acceptingRequests: business.acceptingRequests !== false,
      },
      categories: categories
        .map((c) => ({ id: c._id, name: c.name, items: byCategory.get(String(c._id)) || [] }))
        .filter((c) => c.items.length),
    },
  });
});
