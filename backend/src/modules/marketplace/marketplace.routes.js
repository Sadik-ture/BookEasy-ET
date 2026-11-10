import { Router } from "express";
import { validateQuery } from "../../middleware/validate.js";
import { listQuerySchema } from "./marketplace.validation.js";
import { listBusinesses, getBusiness, listCategories } from "./marketplace.controller.js";

const router = Router();

router.get("/categories", listCategories);
router.get("/businesses", validateQuery(listQuerySchema), listBusinesses);
router.get("/businesses/:slug", getBusiness);

export default router;