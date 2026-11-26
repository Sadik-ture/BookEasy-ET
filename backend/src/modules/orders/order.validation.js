import { z } from "zod";
import { MAX_QTY_PER_ITEM, MAX_DISTINCT_ITEMS } from "./order.constants.js";

const emptyToUndefined = (v) => (v === "" || v === null ? undefined : v);
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid selection");
const phoneOk = /^\+?[\d\s-]{8,20}$/;

export const createOrderSchema = z
  .object({
    businessId: objectId,
    type: z.enum(["takeaway", "dine_in"]).optional().default("takeaway"),
    qrToken: z.preprocess(emptyToUndefined, z.string().regex(/^[a-f0-9]{32,128}$/i, "Scan the table QR code again.").optional()),
    items: z
      .array(
        z.object({
          menuItemId: objectId,
          quantity: z.coerce
            .number()
            .int("Quantity must be a whole number")
            .min(1, "Quantity must be at least 1")
            .max(MAX_QTY_PER_ITEM, `You can order up to ${MAX_QTY_PER_ITEM} of each item`),
        })
      )
      .min(1, "Add at least one item")
      .max(MAX_DISTINCT_ITEMS, "Too many different items in one order"),
    phone: z.preprocess(emptyToUndefined, z.string().trim().optional()),
    notes: z.preprocess(emptyToUndefined, z.string().trim().max(300, "Notes are too long").optional()),
    promoCode: z.preprocess(emptyToUndefined, z.string().trim().max(20, "Code is too long").optional()),
    clientRequestId: z.preprocess(
      emptyToUndefined,
      z.string().regex(/^[A-Za-z0-9-]{8,64}$/, "Invalid request id").optional()
    ),
  })
  .superRefine((data, ctx) => {
    if (data.type === "dine_in" && !data.qrToken) {
      ctx.addIssue({ code: "custom", path: ["qrToken"], message: "Scan the table QR code again." });
    }
    if (data.type !== "dine_in" && !phoneOk.test(data.phone || "")) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a valid phone number" });
    }
    if (data.type === "dine_in" && data.phone && !phoneOk.test(data.phone)) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a valid phone number" });
    }
  });