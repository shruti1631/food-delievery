import express from "express";
import auth from "../middleware/auth.js";
import {
  placeOrder,
  getOrders,
  updateStatus,
  verifyPayment,
  getAllOrders, // ✅ NEW
  getOrderById, // 📍 NEW: Get single order tracking
  cancelOrder, // 🚫 NEW: Cancel order
} from "../controllers/orderController.js";

const router = express.Router();

// Place Order (auth required)
router.post("/place", auth, placeOrder);

// Get User's Own Orders (auth required)
router.get("/list", auth, getOrders);

// Verify Razorpay Payment (auth required)
router.post("/verify", auth, verifyPayment);

// Update Order Status (Admin — no auth for now, add admin middleware later)
router.post("/status", updateStatus);

// ✅ Get All Orders — Admin ke liye (no auth — baad mein admin middleware lagana) - MUST be before /:orderId
router.get("/all", getAllOrders);

// 📍 Get Single Order by ID (auth required - for tracking)
router.get("/:orderId", auth, getOrderById);

// 🚫 Cancel Order (auth required)
router.post("/cancel", auth, cancelOrder);

export default router;
