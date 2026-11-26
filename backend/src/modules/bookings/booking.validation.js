import { z } from "zod";
import { isRealDate } from "../../utils/time.js";

const emptyToUndefined = (v) => (v === "" || v === null ? undefined : v);
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid selection");
const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date")
  .refine(isRealDate, "Choose a valid date");
const timeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid time");

export const createBookingSchema = z.object({
  businessId: objectId,
  serviceId: objectId,
  staffId: z.preprocess(emptyToUndefined, objectId.optional()),
  date: dateStr,
  time: timeStr,
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(300, "Notes are too long").optional()),
});

export const rescheduleSchema = z.object({
  date: dateStr,
  time: timeStr,
});

export const availabilityQuerySchema = z.object({
  serviceId: objectId,
  date: dateStr,
  staffId: z.preprocess(emptyToUndefined, objectId.optional()),
});