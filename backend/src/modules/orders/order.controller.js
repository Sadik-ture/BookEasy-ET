import crypto from "node:crypto";
import Business from "../businesses/business.model.js";
import MenuItem from "../menu/menuItem.model.js";
import Table from "../tables/table.model.js";
import Order from "./order.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isOpenNow } from "../../utils/openNow.js";
import { ACTIVE_ORDER_STATUSES, MAX_QTY_PER_ITEM } from "./order.constants.js";

const fail = (res, status, code, message, fields) =>
  res.status(status).json({
    success: false,
    error: { code, message, ...(fields ? { fields } : {}) },
  });

// Easy to read aloud: no 0/O or 1/I
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeOrderNumber() {
  let s = "";
  for (const b of crypto.randomBytes(6)) s += ALPHABET[b % ALPHABET.length];
  return `BE-${s}`;
}

const view = (o, business) => ({
  id: o._id,
  orderNumber: o.orderNumber,
  type: o.type,
  tableLabel: o.tableLabel || "",
  status: o.status,
  items: o.items.map((i) => ({
    name: i.name,
    quantity: i.quantity,
    priceMinor: i.priceMinor,
    lineTotalMinor: i.lineTotalMinor,
  })),
  totalMinor: o.totalMinor,
  currency: o.currency,
  phone: o.phone,
  notes: o.notes,
  createdAt: o.createdAt,
  business: business
    ? {
        id: business._id,
        name: business.name,
        slug: business.slug,
        address: business.address,
        timezone: business.timezone,
      }
    : null,
});

// POST /api/v1/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { businessId, items, phone, notes, clientRequestId, tableCode } = req.body;

  const business = await Business.findOne({ _id: businessId, status: "approved", category: "restaurant" });
  if (!business) return fail(res, 404, "NOT_FOUND", "Restaurant not found.");

  // Same request sent twice: return the order that already exists
  if (clientRequestId) {
    const existing = await Order.findOne({ customerId: req.user._id, clientRequestId });
    if (existing) return res.json({ success: true, data: { order: view(existing, business) } });
  }

  if (isOpenNow(business.openingHours, business.timezone) === false) {
    return fail(res, 409, "RESTAURANT_CLOSED", `${business.name} is closed right now. Please try again when it opens.`);
  }

  // Dine-in: the table must belong to THIS restaurant and be active (tenant check)
  let table = null;
  if (tableCode) {
    table = await Table.findOne({ code: tableCode, businessId: business._id, active: true }).lean();
    if (!table) {
      return fail(res, 409, "TABLE_INVALID", "This table's QR code isn't valid anymore. Please ask the staff for help.");
    }
  }

  // Merge duplicate lines, then load the REAL items and prices from the database
  const qty = new Map();
  for (const { menuItemId, quantity } of items) {
    const key = String(menuItemId);
    qty.set(key, Math.min(MAX_QTY_PER_ITEM, (qty.get(key) || 0) + quantity));
  }
  const ids = [...qty.keys()];

  // Items must belong to THIS restaurant and be available (tenant check)
  const menuItems = await MenuItem.find({ _id: { $in: ids }, businessId: business._id, available: true }).lean();
  if (menuItems.length !== ids.length) {
    return fail(res, 409, "ITEM_UNAVAILABLE", "Some items are no longer available. Please review your order.", {
      items: "Some items are no longer available.",
    });
  }

  const lines = menuItems.map((m) => {
    const quantity = qty.get(String(m._id));
    return {
      menuItemId: m._id,
      name: m.name,
      priceMinor: m.priceMinor, // price comes from the database, never from the browser
      quantity,
      lineTotalMinor: m.priceMinor * quantity,
    };
  });
  const subtotalMinor = lines.reduce((sum, l) => sum + l.lineTotalMinor, 0);

  let order = null;
  for (let attempt = 0; attempt < 5 && !order; attempt++) {
    try {
      order = await Order.create({
        orderNumber: makeOrderNumber(),
        businessId: business._id,
        customerId: req.user._id,
        type: table ? "dine_in" : "takeaway",
        tableId: table?._id,
        tableLabel: table?.label || "",
        items: lines,
        subtotalMinor,
        totalMinor: subtotalMinor,
        customerName: req.user.fullName,
        phone,
        notes: notes || "",
        clientRequestId,
        statusHistory: [{ status: "pending", at: new Date() }],
      });
    } catch (err) {
      if (err?.code !== 11000) throw err;
      if (err.keyPattern?.clientRequestId) {
        // Two identical requests raced: return the one that won
        const existing = await Order.findOne({ customerId: req.user._id, clientRequestId });
        if (existing) return res.json({ success: true, data: { order: view(existing, business) } });
      }
      // otherwise the order number collided: loop and try a new one
    }
  }
  if (!order) throw new Error("Could not generate a unique order number");

  res.status(201).json({ success: true, data: { order: view(order, business) } });
});

// GET /api/v1/orders/my?scope=active|past
export const myOrders = asyncHandler(async (req, res) => {
  const scope = req.query.scope === "past" ? "past" : "active";

  const filter = { customerId: req.user._id }; // customers only ever see their own orders
  filter.status = scope === "active" ? { $in: ACTIVE_ORDER_STATUSES } : { $nin: ACTIVE_ORDER_STATUSES };

  const items = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("businessId", "name slug address timezone")
    .lean();

  res.json({ success: true, data: { items: items.map((o) => view(o, o.businessId)) } });
});

// PATCH /api/v1/orders/:id/cancel  (customers can cancel only while the order is still "pending")
export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!/^[a-f\d]{24}$/i.test(id)) return fail(res, 404, "NOT_FOUND", "Order not found.");

  const order = await Order.findOneAndUpdate(
    { _id: id, customerId: req.user._id, status: "pending" },
    {
      $set: { status: "cancelled", cancelledAt: new Date(), cancelledBy: "customer" },
      $push: { statusHistory: { status: "cancelled", at: new Date() } },
    },
    { new: true }
  );

  if (!order) {
    return fail(
      res,
      409,
      "CANNOT_CANCEL",
      "This order can no longer be cancelled because the restaurant has already started on it."
    );
  }

  res.json({ success: true, data: { id: order._id, status: order.status } });
});