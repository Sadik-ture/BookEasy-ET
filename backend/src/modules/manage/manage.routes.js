import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { loadMyBusiness, requireCategory } from "./manage.middleware.js";
import * as v from "./manage.validation.js";
import { createBusiness, getMyBusiness, updateSettings, overview } from "./business.controller.js";
import { listBookings, updateBookingStatus } from "./bookings.controller.js";
import { listOrders, updateOrderStatus } from "./orders.controller.js";
import { getMenu, createCategory, createItem, updateItem } from "./menu.controller.js";
import { listServices, createService, updateService, listStaff, createStaff, updateStaff } from "./catalog.controller.js";
import { listTables, createTables, updateTable, rotateTable } from "./tables.controller.js";

const router = Router();

router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please slow down." } },
  })
);
router.use(requireAuth);

// Any logged-in user can create their business
router.post("/business", validate(v.createBusinessSchema), createBusiness);

// Everything below acts on the business this user owns
router.use(loadMyBusiness);
router.get("/business", getMyBusiness);
router.patch("/business/settings", validate(v.settingsSchema), updateSettings);
router.get("/overview", overview);

const bookable = requireCategory("barbershop", "salon");
const restaurant = requireCategory("restaurant");

// Bookings, services and staff (barbershops and salons)
router.get("/bookings", bookable, listBookings);
router.patch("/bookings/:id/status", bookable, validate(v.bookingStatusSchema), updateBookingStatus);
router.get("/services", bookable, listServices);
router.post("/services", bookable, validate(v.createServiceSchema), createService);
router.patch("/services/:id", bookable, validate(v.updateServiceSchema), updateService);
router.get("/staff", bookable, listStaff);
router.post("/staff", bookable, validate(v.createStaffSchema), createStaff);
router.patch("/staff/:id", bookable, validate(v.updateStaffSchema), updateStaff);

// Orders, menu and tables (restaurants)
router.get("/orders", restaurant, listOrders);
router.patch("/orders/:id/status", restaurant, validate(v.orderStatusSchema), updateOrderStatus);
router.get("/menu", restaurant, getMenu);
router.post("/menu/categories", restaurant, validate(v.createCategorySchema), createCategory);
router.post("/menu/items", restaurant, validate(v.createItemSchema), createItem);
router.patch("/menu/items/:id", restaurant, validate(v.updateItemSchema), updateItem);
router.get("/tables", restaurant, listTables);
router.post("/tables", restaurant, validate(v.createTablesSchema), createTables);
router.patch("/tables/:id", restaurant, validate(v.updateTableSchema), updateTable);
router.post("/tables/:id/rotate", restaurant, rotateTable);

export default router;