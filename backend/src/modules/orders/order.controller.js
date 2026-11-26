import crypto from "node:crypto";
import Business from "../businesses/business.model.js";
import MenuItem from "../menu/menuItem.model.js";
import Order from "./order.model.js";
import RestaurantTable from "../tables/table.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isOpenNow } from "../../utils/openNow.js";
import { ACTIVE_ORDER_STATUSES, MAX_QTY_PER_ITEM } from "./order.constants.js";
import { lineTotalMinor, sumMinor } from "../../utils/money.js";
import { WELCOME_CODE, discountForCode } from "../../utils/promo.js";
import { notifyUser, notifyBusiness } from "../notifications/notify.js";

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
  status: o.status,
  items: o.items.map((i) => ({
    menuItemId: i.menuItemId,
    name: i.name,
    quantity: i.quantity,
    priceMinor: i.priceMinor,
    lineTotalMinor: i.lineTotalMinor,
  })),
  subtotalMinor: o.subtotalMinor,
  discountMinor: o.discountMinor || 0,
  promoCode: o.promoCode || "",
  totalMinor: o.totalMinor,
  currency: o.currency,
  phone: o.phone,
  notes: o.notes,
  createdAt: o.createdAt,
  tableLabel: o.tableLabel || "",
  estimatedReadyAt: o.estimatedReadyAt || null,
  collectionNote:
    o.type === "dine_in"
      ? `This order is for table ${o.tableLabel || ""}. Pay at the table when it is served.`
      : o.status === "ready"
        ? "Your order is ready to collect at the restaurant."
        : "",
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
  const { businessId, items, phone, notes, clientRequestId, type = "takeaway", qrToken, promoCode } = req.body;

  let table = null;
  if (type === "dine_in") {
    table = await RestaurantTable.findOne({ qrToken, active: true });
    if (!table || String(table.businessId) !== String(businessId)) {
      return fail(res, 404, "NOT_FOUND", "That table is not active. Scan the QR code on your table.");
    }
  }

  const business = await Business.findOne({ _id: businessId, status: "approved", category: "restaurant" });
  if (!business) return fail(res, 404, "NOT_FOUND", "Restaurant not found.");
  if (business.acceptingRequests === false) {
    return fail(res, 409, "NOT_ACCEPTING", `${business.name} is not taking orders right now.`);
  }

  // Same request sent twice: return the order that already exists
  if (clientRequestId) {
    const existing = await Order.findOne({ customerId: req.user._id, clientRequestId });
    if (existing) return res.json({ success: true, data: { order: view(existing, business) } });
  }

  if (isOpenNow(business.openingHours, business.timezone) === false) {
    return fail(res, 409, "RESTAURANT_CLOSED", `${business.name} is closed right now. Please try again when it opens.`);
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
      lineTotalMinor: lineTotalMinor(m.priceMinor, quantity),
    };
  });
  const subtotalMinor = sumMinor(lines);
  const code = String(promoCode || "").trim().toUpperCase();
  let discountMinor = 0;
  if (code) {
    const quote = discountForCode(code, subtotalMinor);
    if (!quote) return fail(res, 400, "PROMO_INVALID", "That code is not valid.");
    if (type === "dine_in") return fail(res, 400, "PROMO_INVALID", "BOOK10 applies to takeaway orders.");
    const used = await Order.exists({
      customerId: req.user._id,
      promoCode: WELCOME_CODE,
      status: { $nin: ["cancelled", "rejected"] },
    });
    if (used) return fail(res, 409, "PROMO_USED", "You have already used BOOK10.");
    discountMinor = quote.discountMinor;
  }

  let order = null;
  for (let attempt = 0; attempt < 5 && !order; attempt++) {
    try {
      order = await Order.create({
        orderNumber: makeOrderNumber(),
        businessId: business._id,
        customerId: req.user._id,
        type: type === "dine_in" ? "dine_in" : "takeaway",
        tableId: table?._id,
        tableLabel: table?.label || "",
        items: lines,
        subtotalMinor,
        discountMinor,
        promoCode: discountMinor ? WELCOME_CODE : "",
        totalMinor: subtotalMinor - discountMinor,
        customerName: req.user.fullName,
        phone: phone || req.user.phone || "At table",
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

  await notifyUser({
    userId: req.user._id,
    businessId: business._id,
    type: "order",
    title: "Order received",
    body: `${business.name} has your order ${order.orderNumber}.`,
    link: "/my-orders",
  });
  await notifyBusiness(business._id, "orders", {
    type: "order",
    title: "New order",
    body: `${order.orderNumber} is waiting${table ? ` for table ${table.label}` : ""}.`,
    link: "/workspace/orders",
  });

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