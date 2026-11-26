import { Router } from "express";
import { resolveTable } from "./table.controller.js";

const router = Router();
router.get("/:qrToken", resolveTable);
export default router;
