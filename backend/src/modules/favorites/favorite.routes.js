import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { listFavorites, saveFavorite, removeFavorite } from "./favorite.controller.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid selection");
const router = Router();

router.use(requireAuth);
router.get("/", listFavorites);
router.post("/", validate(z.object({ businessId: objectId })), saveFavorite);
router.delete("/:businessId", removeFavorite);

export default router;
