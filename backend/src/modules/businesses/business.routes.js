import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { registerBusinessSchema } from "./business.validation.js";
import { registerBusiness } from "./business.controller.js";

const router = Router();

router.post("/register", requireAuth, validate(registerBusinessSchema), registerBusiness);

export default router;
