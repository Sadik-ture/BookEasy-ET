import MenuCategory from "../menu/menuCategory.model.js";
import MenuItem from "../menu/menuItem.model.js";
import asyncHandler from "../../utils/asyncHandler.js";

const fail = (res, status, code, message, fields) =>
  res.status(status).json({ success: false, error: { code, message, ...(fields ? { fields } : {}) } });
const isDup = (e) => e?.code === 11000;
const dupName = (res) =>
  fail(res, 409, "DUPLICATE", "Please review the submitted information.", { name: "You already have one with this name." });

// GET /api/v1/manage/menu  (includes hidden items)
export const getMenu = asyncHandler(async (req, res) => {
  const bid = req.business._id;
  const [cats, items] = await Promise.all([
    MenuCategory.find({ businessId: bid }).sort({ sortOrder: 1, name: 1 }).lean(),
    MenuItem.find({ businessId: bid }).sort({ sortOrder: 1, name: 1 }).lean(),
  ]);
  const byCat = new Map();
  for (const i of items) {
    const k = String(i.categoryId);
    if (!byCat.has(k)) byCat.set(k, []);
    byCat.get(k).push({
      id: i._id,
      name: i.name,
      description: i.description,
      priceMinor: i.priceMinor,
      available: i.available,
    });
  }
  res.json({
    success: true,
    data: { categories: cats.map((c) => ({ id: c._id, name: c.name, items: byCat.get(String(c._id)) || [] })) },
  });
});

// POST /api/v1/manage/menu/categories
export const createCategory = asyncHandler(async (req, res) => {
  const count = await MenuCategory.countDocuments({ businessId: req.business._id });
  try {
    const cat = await MenuCategory.create({ businessId: req.business._id, name: req.body.name, sortOrder: count });
    res.status(201).json({ success: true, data: { id: cat._id } });
  } catch (err) {
    if (isDup(err)) return dupName(res);
    throw err;
  }
});

// POST /api/v1/manage/menu/items
export const createItem = asyncHandler(async (req, res) => {
  const { categoryId, name, description, priceBirr } = req.body;
  // The category must belong to THIS business
  if (!(await MenuCategory.exists({ _id: categoryId, businessId: req.business._id }))) {
    return fail(res, 404, "NOT_FOUND", "Category not found.");
  }
  const count = await MenuItem.countDocuments({ businessId: req.business._id, categoryId });
  try {
    const item = await MenuItem.create({
      businessId: req.business._id,
      categoryId,
      name,
      description: description || "",
      priceMinor: Math.round(priceBirr * 100),
      sortOrder: count,
    });
    res.status(201).json({ success: true, data: { id: item._id } });
  } catch (err) {
    if (isDup(err)) return dupName(res);
    throw err;
  }
});

// PATCH /api/v1/manage/menu/items/:id
export const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!/^[a-f\d]{24}$/i.test(id)) return fail(res, 404, "NOT_FOUND", "Item not found.");

  const { categoryId, name, description, priceBirr, available } = req.body;
  const set = {};
  if (name !== undefined) set.name = name;
  if (description !== undefined) set.description = description;
  if (priceBirr !== undefined) set.priceMinor = Math.round(priceBirr * 100);
  if (available !== undefined) set.available = available;
  if (categoryId !== undefined) {
    if (!(await MenuCategory.exists({ _id: categoryId, businessId: req.business._id }))) {
      return fail(res, 404, "NOT_FOUND", "Category not found.");
    }
    set.categoryId = categoryId;
  }

  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: id, businessId: req.business._id },
      { $set: set },
      { new: true, runValidators: true }
    );
    if (!item) return fail(res, 404, "NOT_FOUND", "Item not found.");
    res.json({ success: true, data: { id: item._id } });
  } catch (err) {
    if (isDup(err)) return dupName(res);
    throw err;
  }
});