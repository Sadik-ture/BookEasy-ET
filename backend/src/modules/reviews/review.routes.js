import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { listPublic, eligible, createReview } from "./review.controller.js";

const router = Router();
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid selection");

const createSchema = z
  .object({
    bookingId: objectId.optional(),
    orderId: objectId.optional(),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().max(600).optional().default(""),
  })
  .refine((v) => v.bookingId || v.orderId, { message: "Choose a completed visit." });

router.get("/businesses/:slug/reviews", listPublic);
router.get("/reviews/eligible", requireAuth, eligible);
router.post("/reviews", requireAuth, validate(createSchema), createReview);

export default router;
