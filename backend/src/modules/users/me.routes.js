import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import Booking from "../bookings/booking.model.js";
import Order from "../orders/order.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { ACTIVE_STATUSES } from "../bookings/booking.constants.js";
import { ACTIVE_ORDER_STATUSES } from "../orders/order.constants.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const customerId = req.user._id;
    const [upcomingBookings, activeOrders, doneBookings, doneOrders] = await Promise.all([
      Booking.countDocuments({ customerId, status: { $in: ACTIVE_STATUSES }, startAt: { $gte: new Date() } }),
      Order.countDocuments({ customerId, status: { $in: ACTIVE_ORDER_STATUSES } }),
      Booking.countDocuments({ customerId, status: "completed" }),
      Order.countDocuments({ customerId, status: "completed" }),
    ]);
    res.json({
      success: true,
      data: { upcomingBookings, activeOrders, completed: doneBookings + doneOrders, favorites: 0 },
    });
  })
);

export default router;