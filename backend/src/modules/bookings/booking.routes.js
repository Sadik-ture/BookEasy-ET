import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createBookingSchema, rescheduleSchema } from "./booking.validation.js";
import { createBooking, myBookings, cancelBooking, getBooking, rescheduleBooking } from "./booking.controller.js";

const router = Router();

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many booking attempts. Please try again in a few minutes." },
  },
});

router.use(requireAuth);
router.post("/", bookingLimiter, validate(createBookingSchema), createBooking);
router.get("/my", myBookings);
router.get("/:id", getBooking);
router.patch("/:id/cancel", cancelBooking);
router.patch("/:id/reschedule", validate(rescheduleSchema), rescheduleBooking);

export default router;