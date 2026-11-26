import { z } from "zod";
import { CATEGORY_KEYS } from "./business.constants.js";

const timeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 09:00");

export const hoursSchema = z
  .array(
    z.object({
      day: z.number().int().min(0).max(6),
      open: timeStr,
      close: timeStr,
      closed: z.boolean(),
    })
  )
  .length(7, "Add hours for every day of the week");

const addressSchema = z.object({
  line: z.string().trim().max(120).optional().default(""),
  area: z.string().trim().max(80).optional().default(""),
  city: z.string().trim().min(2, "Enter a city").max(80),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const registerBusinessSchema = z.object({
  name: z.string().trim().min(2, "Enter the business name").max(100),
  category: z.enum(CATEGORY_KEYS),
  description: z.string().trim().max(1000).optional().default(""),
  phone: z.string().trim().max(20).optional().default(""),
  address: addressSchema,
  openingHours: hoursSchema,
});

export const updateBusinessSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  phone: z.string().trim().max(20).optional(),
  address: addressSchema.optional(),
  openingHours: hoursSchema.optional(),
  acceptingRequests: z.boolean().optional(),
  timezone: z.string().trim().min(1).max(64).optional(),
});
