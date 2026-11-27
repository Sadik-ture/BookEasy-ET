import mongoose from "mongoose";
import { ORDER_TYPES, ORDER_STATUSES } from "./order.constants.js";

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    // Snapshots, so later menu edits never change an existing order
    name: { type: String, required: true },
    priceMinor: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 20 },
    lineTotalMinor: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ORDER_TYPES, default: "takeaway" },

    // Set for dine-in orders placed by scanning a table QR code
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    tableLabel: { type: String, default: "" }, // snapshot, so renaming a table doesn't rewrite history

    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, "An order needs at least one item"],
    },
    subtotalMinor: { type: Number, required: true, min: 0 },
    totalMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "ETB" },
    status: { type: String, enum: ORDER_STATUSES, default: "pending" },

    customerName: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, maxlength: 300, default: "" },

    // Sent by the browser so a double click or retry can't create a second order
    clientRequestId: { type: String },

    statusHistory: [{ _id: false, status: { type: String, enum: ORDER_STATUSES }, at: { type: Date } }],
    cancelledAt: { type: Date },
    cancelledBy: { type: String, enum: ["customer", "business"] },
  },
  { timestamps: true }
);

orderSchema.index({ businessId: 1, createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index(
  { customerId: 1, clientRequestId: 1 },
  { unique: true, partialFilterExpression: { clientRequestId: { $type: "string" } } }
);

export default mongoose.model("Order", orderSchema);