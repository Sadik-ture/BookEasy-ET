import Order from "../orders/order.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { ACTIVE_ORDER_STATUSES, ORDER_TRANSITIONS } from "../orders/order.constants.js";

const fail = (res, status, code, message) => res.status(status).json({ success: false, error: { code, message } });

const view = (o) => ({
  id: o._id,
  orderNumber: o.orderNumber,
   type: o.type,
  tableLabel: o.tableLabel || "",
  status: o.status,
  items: o.items.map((i) => ({ name: i.name, quantity: i.quantity, lineTotalMinor: i.lineTotalMinor })),
  totalMinor: o.totalMinor,
  currency: o.currency,
  customerName: o.customerName,
  phone: o.phone,
  notes: o.notes,
  createdAt: o.createdAt,
});

// GET /api/v1/manage/orders?scope=active|past
export const listOrders = asyncHandler(async (req, res) => {
  const scope = req.query.scope === "past" ? "past" : "active";
  const active = scope === "active";

  const items = await Order.find({
    businessId: req.business._id,
    status: active ? { $in: ACTIVE_ORDER_STATUSES } : { $nin: ACTIVE_ORDER_STATUSES },
  })
    .sort({ createdAt: active ? 1 : -1 }) // kitchen queue: oldest first
    .limit(60)
    .lean();

  res.json({ success: true, data: { items: items.map(view) } });
});

// PATCH /api/v1/manage/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!/^[a-f\d]{24}$/i.test(id)) return fail(res, 404, "NOT_FOUND", "Order not found.");

  const allowedFrom = Object.entries(ORDER_TRANSITIONS)
    .filter(([, next]) => next.includes(status))
    .map(([from]) => from);

  const update = { $set: { status }, $push: { statusHistory: { status, at: new Date() } } };
  if (status === "cancelled" || status === "rejected") {
    update.$set.cancelledAt = new Date();
    update.$set.cancelledBy = "business";
  }

  const order = await Order.findOneAndUpdate(
    { _id: id, businessId: req.business._id, status: { $in: allowedFrom } },
    update,
    { new: true }
  );
  if (!order) return fail(res, 409, "INVALID_STATUS", "This order can't be changed that way. Refresh and try again.");

  res.json({ success: true, data: { id: order._id, status: order.status } });
});