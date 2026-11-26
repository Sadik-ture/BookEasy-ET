import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import { register, login, logout, me, updateProfile, changePassword, forgotPassword, resetPassword } from "./auth.controller.js";

const router = Router();

// Slow down brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many attempts. Please try again in a few minutes." },
  },
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);
router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, validate(updateProfileSchema), updateProfile);
router.post("/change-password", requireAuth, validate(changePasswordSchema), changePassword);

export default router;