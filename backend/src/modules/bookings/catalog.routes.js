import { Router } from "express";
import { validateQuery } from "../../middleware/validate.js";
import { availabilityQuerySchema } from "./booking.validation.js";
import { listServices, listStaff, getAvailability } from "./catalog.controller.js";

const router = Router();

router.get("/:slug/services", listServices);
router.get("/:slug/staff", listStaff);
router.get("/:slug/availability", validateQuery(availabilityQuerySchema), getAvailability);

export default router;