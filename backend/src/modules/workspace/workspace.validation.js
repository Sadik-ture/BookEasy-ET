import { z } from "zod";
import { hoursSchema } from "../businesses/business.validation.js";

const emptyToUndefined = (v) => (v === "" || v === null ? undefined : v);
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid selection");
const timeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 09:00");
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export { hoursSchema };

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).optional().default(""),
  priceMinor: z.coerce.number().int().min(0).max(10_000_000),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  active: z.boolean().optional(),
});

export const serviceUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(300).optional(),
  priceMinor: z.coerce.number().int().min(0).max(10_000_000).optional(),
  durationMinutes: z.coerce.number().int().min(5).max(480).optional(),
  active: z.boolean().optional(),
});

const shiftList = z
  .array(
    z.object({
      day: z.number().int().min(0).max(6),
      start: timeStr,
      end: timeStr,
      breakStart: z.preprocess(emptyToUndefined, timeStr.optional()),
      breakEnd: z.preprocess(emptyToUndefined, timeStr.optional()),
      off: z.boolean().optional().default(false),
    })
  )
  .max(7)
  .optional();

const timeOffList = z
  .array(
    z.object({
      startDate: dateStr,
      endDate: dateStr,
      reason: z.string().trim().max(120).optional().default(""),
    })
  )
  .max(30)
  .optional();

export const staffSchema = z.object({
  name: z.string().trim().min(2).max(80),
  title: z.string().trim().max(80).optional().default(""),
  serviceIds: z.array(objectId).max(40).optional().default([]),
  active: z.boolean().optional(),
  userId: z.preprocess(emptyToUndefined, objectId.optional()),
  workingHours: shiftList,
  timeOff: timeOffList,
});

export const staffUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  title: z.string().trim().max(80).optional(),
  serviceIds: z.array(objectId).max(40).optional(),
  active: z.boolean().optional(),
  userId: z.preprocess(emptyToUndefined, objectId.optional()),
  workingHours: shiftList,
  timeOff: timeOffList,
});

export const inviteSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["manager", "receptionist", "staff", "kitchen"]),
});

export const membershipPatchSchema = z.object({
  role: z.enum(["manager", "receptionist", "staff", "kitchen"]).optional(),
  status: z.enum(["active", "removed"]).optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
  active: z.boolean().optional(),
});

export const menuItemSchema = z.object({
  categoryId: objectId,
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(200).optional().default(""),
  priceMinor: z.coerce.number().int().min(0).max(10_000_000),
  available: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const menuItemUpdateSchema = z.object({
  categoryId: objectId.optional(),
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(200).optional(),
  priceMinor: z.coerce.number().int().min(0).max(10_000_000).optional(),
  available: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const bookingStatusSchema = z.object({
  status: z.enum(["confirmed", "rejected", "cancelled", "completed", "no_show"]),
});

export const orderStatusSchema = z.object({
  status: z.enum(["accepted", "rejected", "preparing", "ready", "completed", "cancelled"]),
  estimatedMinutes: z.coerce.number().int().min(5).max(240).optional(),
});

export const tableSchema = z.object({
  label: z.string().trim().min(1).max(40),
});

export const replySchema = z.object({
  reply: z.string().trim().min(1).max(600),
});

export const rescheduleSchema = z.object({
  date: dateStr,
  time: timeStr,
});
