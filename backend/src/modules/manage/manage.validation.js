import { z } from "zod";
import { CATEGORY_KEYS } from "../businesses/business.constants.js";
import { toMinutes } from "../../utils/time.js";

const empty = (v) => (v === "" || v === null ? undefined : v);
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid selection");
const timeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid time");
const birr = z.coerce.number().min(0, "Price cannot be negative").max(1000000, "Price is too high");
const phone = z.string().trim().regex(/^\+?[\d\s-]{8,20}$/, "Enter a valid phone number");
const notEmpty = (v) => Object.keys(v).length > 0;

export const createBusinessSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter the business name").max(100, "Name is too long"),
    category: z.enum(CATEGORY_KEYS),
    phone: z.preprocess(empty, phone.optional()),
    description: z.preprocess(empty, z.string().trim().max(1000, "Description is too long").optional()),
    area: z.string().trim().min(2, "Please enter the area, for example Bole").max(60, "Area is too long"),
    addressLine: z.preprocess(empty, z.string().trim().max(120, "Address is too long").optional()),
    openTime: timeStr,
    closeTime: timeStr,
    closedDays: z.array(z.coerce.number().int().min(0).max(6)).max(6, "Open at least one day a week").default([]),
  })
  .refine((v) => toMinutes(v.closeTime) > toMinutes(v.openTime), {
    path: ["closeTime"],
    message: "Closing time must be after opening time",
  });

export const settingsSchema = z.object({ autoConfirm: z.boolean() });

export const bookingStatusSchema = z.object({
  status: z.enum(["confirmed", "rejected", "completed", "no_show", "cancelled"]),
});
export const orderStatusSchema = z.object({
  status: z.enum(["accepted", "preparing", "ready", "completed", "rejected", "cancelled"]),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Enter a category name").max(60, "Name is too long"),
});
export const createItemSchema = z.object({
  categoryId: objectId,
  name: z.string().trim().min(2, "Enter the item name").max(80, "Name is too long"),
  description: z.preprocess(empty, z.string().trim().max(200, "Description is too long").optional()),
  priceBirr: birr,
});
export const updateItemSchema = z
  .object({
    categoryId: objectId.optional(),
    name: z.string().trim().min(2, "Enter the item name").max(80, "Name is too long").optional(),
    description: z.string().trim().max(200, "Description is too long").optional(),
    priceBirr: birr.optional(),
    available: z.boolean().optional(),
  })
  .refine(notEmpty, "Nothing to update");

const duration = z.coerce.number().int("Use whole minutes").min(5, "At least 5 minutes").max(480, "At most 8 hours");
export const createServiceSchema = z.object({
  name: z.string().trim().min(2, "Enter the service name").max(100, "Name is too long"),
  description: z.preprocess(empty, z.string().trim().max(300, "Description is too long").optional()),
  priceBirr: birr,
  durationMinutes: duration,
});
export const updateServiceSchema = z
  .object({
    name: z.string().trim().min(2, "Enter the service name").max(100, "Name is too long").optional(),
    description: z.string().trim().max(300, "Description is too long").optional(),
    priceBirr: birr.optional(),
    durationMinutes: duration.optional(),
    active: z.boolean().optional(),
  })
  .refine(notEmpty, "Nothing to update");

export const createStaffSchema = z.object({
  name: z.string().trim().min(2, "Enter the name").max(80, "Name is too long"),
  title: z.preprocess(empty, z.string().trim().max(80, "Title is too long").optional()),
  serviceIds: z.array(objectId).max(50).default([]),
});
export const updateStaffSchema = z
  .object({
    name: z.string().trim().min(2, "Enter the name").max(80, "Name is too long").optional(),
    title: z.string().trim().max(80, "Title is too long").optional(),
    serviceIds: z.array(objectId).max(50).optional(),
    active: z.boolean().optional(),
  })
  .refine(notEmpty, "Nothing to update");