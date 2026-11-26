import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./modules/auth/auth.routes.js";
import marketplaceRoutes from "./modules/marketplace/marketplace.routes.js";
import bookingRoutes from "./modules/bookings/booking.routes.js";
import catalogRoutes from "./modules/bookings/catalog.routes.js";
import menuRoutes from "./modules/menu/menu.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import manageRoutes from "./modules/manage/manage.routes.js";
import meRoutes from "./modules/users/me.routes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    data: {
      app: "BookEasy ET API",
      status: "running",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    },
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/me", meRoutes);
app.use("/api/v1/manage", manageRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/businesses", catalogRoutes);
app.use("/api/v1/businesses", menuRoutes);
app.use("/api/v1", marketplaceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: { code: "SERVER_ERROR", message: "Something went wrong" },
  });
});

export default app;