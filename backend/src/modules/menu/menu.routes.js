import { Router } from "express";
import { getMenu } from "./menu.controller.js";

const router = Router();

router.get("/:slug/menu", getMenu);

export default router;