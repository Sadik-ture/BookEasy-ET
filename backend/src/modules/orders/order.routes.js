import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createOrderSchema } from "./order.validation.js";
import { createOrder, myOrders, cancelOrder } from "./order.controller.js";

const router = Router();

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many order attempts. Please try again in a few minutes." },
  },
});

router.use(requireAuth);
router.post("/", orderLimiter, validate(createOrderSchema), createOrder);
router.get("/my", myOrders);
router.patch("/:id/cancel", cancelOrder);

export default router;