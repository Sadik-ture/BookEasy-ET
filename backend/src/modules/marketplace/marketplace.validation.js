import { z } from "zod";
import { CATEGORY_KEYS } from "../businesses/business.constants.js";

const emptyToUndefined = (v) => (v === "" ? undefined : v);

export const listQuerySchema = z.object({
  category: z.preprocess(emptyToUndefined, z.enum(CATEGORY_KEYS).optional()),
  search: z.preprocess(emptyToUndefined, z.string().trim().max(60, "Search is too long").optional()),
  sort: z.enum(["popular", "rating", "newest"]).default("popular"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(12),
});