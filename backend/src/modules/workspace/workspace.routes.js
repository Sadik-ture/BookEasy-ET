import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/tenant.js";
import { validate } from "../../middleware/validate.js";
import { imageUpload } from "../../middleware/upload.js";
import { updateBusinessSchema } from "../businesses/business.validation.js";
import { updateOwnedBusiness } from "../businesses/business.controller.js";
import {
  serviceSchema,
  serviceUpdateSchema,
  staffSchema,
  staffUpdateSchema,
  inviteSchema,
  membershipPatchSchema,
  categorySchema,
  menuItemSchema,
  menuItemUpdateSchema,
  bookingStatusSchema,
  orderStatusSchema,
  tableSchema,
  replySchema,
} from "./workspace.validation.js";
import * as catalog from "./catalog.controller.js";
import * as ops from "./operations.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/dashboard", requirePermission(), ops.dashboard);

router.get("/profile", requirePermission("profile"), catalog.getProfile);
router.patch("/profile", requirePermission("profile"), validate(updateBusinessSchema), updateOwnedBusiness);
router.post("/profile/logo", requirePermission("profile"), imageUpload("image"), catalog.uploadLogo);
router.post("/profile/cover", requirePermission("profile"), imageUpload("image"), catalog.uploadCover);
router.post("/profile/gallery", requirePermission("profile"), imageUpload("image"), catalog.uploadGallery);

router.get("/services", requirePermission("catalog"), catalog.listServices);
router.post("/services", requirePermission("catalog"), validate(serviceSchema), catalog.createService);
router.patch("/services/:id", requirePermission("catalog"), validate(serviceUpdateSchema), catalog.updateService);

router.get("/staff", requirePermission("catalog"), catalog.listStaff);
router.post("/staff", requirePermission("catalog"), validate(staffSchema), catalog.createStaff);
router.patch("/staff/:id", requirePermission("catalog"), validate(staffUpdateSchema), catalog.updateStaff);

router.get("/team", requirePermission("team"), catalog.listTeam);
router.post("/team", requirePermission("team"), validate(inviteSchema), catalog.inviteMember);
router.patch("/team/:id", requirePermission("team"), validate(membershipPatchSchema), catalog.updateMember);

router.get("/menu/categories", requirePermission("catalog"), catalog.listCategories);
router.post("/menu/categories", requirePermission("catalog"), validate(categorySchema), catalog.createCategory);
router.patch("/menu/categories/:id", requirePermission("catalog"), validate(categorySchema.partial()), catalog.updateCategory);
router.get("/menu/items", requirePermission("catalog"), catalog.listMenuItems);
router.post("/menu/items", requirePermission("catalog"), validate(menuItemSchema), catalog.createMenuItem);
router.patch("/menu/items/:id", requirePermission("catalog"), validate(menuItemUpdateSchema), catalog.updateMenuItem);
router.post("/menu/items/:id/image", requirePermission("catalog"), imageUpload("image"), catalog.uploadMenuImage);

router.get("/bookings", requirePermission("bookings"), ops.listBookings);
router.patch("/bookings/:id/status", requirePermission("bookings"), validate(bookingStatusSchema), ops.updateBookingStatus);

router.get("/orders", requirePermission("orders"), ops.listOrders);
router.patch("/orders/:id/status", requirePermission("orders"), validate(orderStatusSchema), ops.updateOrderStatus);

router.get("/tables", requirePermission("tables"), ops.listTables);
router.post("/tables", requirePermission("tables"), validate(tableSchema), ops.createTable);
router.post("/tables/:id/qr", requirePermission("tables"), ops.rotateQr);
router.get("/tables/:id/qr", requirePermission("tables"), ops.tableQrPng);

router.get("/reports", requirePermission("reports"), ops.reports);
router.get("/subscription", requirePermission("subscription"), ops.subscription);
router.get("/reviews", requirePermission("profile"), ops.listBusinessReviews);
router.patch("/reviews/:id/reply", requirePermission("profile"), validate(replySchema), ops.replyToReview);

export default router;
