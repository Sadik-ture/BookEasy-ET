import { Router } from "express";
import rateLimit from "express-rate-limit";
import { lookupTable } from "./tables.controller.js";

const router = Router();

// Slows down anyone trying to guess codes
router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again shortly." } },
  })
);

router.get("/:code", lookupTable);

export default router;