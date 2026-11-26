import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  metrics,
  listBusinesses,
  setBusinessStatus,
  listUsers,
  setUserStatus,
  setUserRole,
  listPlans,
  assignSubscription,
  listReviews,
  moderateReview,
  listCategories,
  updateCategories,
  listAudit,
} from "./admin.controller.js";

const router = Router();
router.use(requireAuth, requireRole("super_admin", "support_admin"));

router.get("/metrics", metrics);
router.get("/businesses", listBusinesses);
router.patch("/businesses/:id/status", setBusinessStatus);
router.get("/users", listUsers);
router.patch("/users/:id/status", setUserStatus);
router.patch("/users/:id/role", setUserRole);
router.get("/plans", listPlans);
router.post("/subscriptions", assignSubscription);
router.get("/reviews", listReviews);
router.patch("/reviews/:id", moderateReview);
router.get("/categories", listCategories);
router.patch("/categories", updateCategories);
router.get("/audit", listAudit);

export default router;
