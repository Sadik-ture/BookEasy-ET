import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { listMine, markRead, markAllRead } from "./notification.controller.js";

const router = Router();
router.use(requireAuth);
router.get("/", listMine);
router.post("/read-all", markAllRead);
router.patch("/:id/read", markRead);

export default router;
