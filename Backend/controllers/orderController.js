import Order from "../models/Order.js";
import Cart from "../models/cart.js";
import Food from "../models/food.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys missing in .env ❌");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// 🧾 Place Order
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.json({ success: false, message: "Cart is empty" });
    }

    let totalAmount = 0;
    const populatedItems = [];

    for (const item of cart.items) {
      const food = await Food.findById(item.foodId);
      if (food) {
        totalAmount += food.price * item.quantity;
        populatedItems.push({
          foodId: item.foodId,
          quantity: item.quantity,
          price: food.price,
        });
      }
    }

    if (totalAmount === 0) {
      return res.json({ success: false, message: "Amount could not be calculated" });
    }

    // 💳 ONLINE
    if (paymentMethod === "ONLINE") {
      const razorpay = getRazorpayInstance();
      const options = {
        amount: totalAmount * 100,
        currency: "INR",
        receipt: "order_" + Date.now(),
      };
      const razorpayOrder = await razorpay.orders.create(options);

      const order = new Order({
        userId,
        items: populatedItems,
        amount: totalAmount,
        address,
        paymentMethod: "ONLINE",
        payment: false,
        statusTimeline: [{ status: "Pending", message: "Waiting for payment confirmation ⏳" }],
        estimatedDelivery: new Date(Date.now() + 45 * 60000),
      });
      await order.save();

      return res.json({
        success: true,
        razorpayOrder,
        orderId: order._id,
        orderTime: order.createdAt,
      });
    }

    // 💵 COD
    const order = new Order({
      userId,
      items: populatedItems,
      amount: totalAmount,
      address,
      paymentMethod: "COD",
      payment: false,        // ✅ Pending — Delivered hone par true hoga
      statusTimeline: [{ status: "Pending", message: "Your order has been placed ✅" }],
      estimatedDelivery: new Date(Date.now() + 45 * 60000),
    });
    await order.save();

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Order placed successfully (COD) ✅",
      order: {
        _id: order._id,
        amount: order.amount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        payment: order.payment,
        orderTime: order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
        items: order.items.length
      },
      orderTime: order.createdAt
    });

  } catch (error) {
    // Razorpay errors have shape { statusCode, error: { description, code, ... } }
    // instead of a normal Error.message, so we extract that properly.
    console.log("❌ Place Order Error (full):", JSON.stringify(error, null, 2));
    const razorpayMsg = error?.error?.description;
    const finalMessage = razorpayMsg || error.message || "Order place nahi ho paya. Backend terminal check karo.";
    res.json({ success: false, message: finalMessage });
  }
};

// 🔐 VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const order = await Order.findById(orderId);
      if (!order) return res.json({ success: false, message: "Order not found ❌" });

      order.payment = true;
      order.paymentId = razorpay_payment_id;
      order.status = "Preparing";
      order.statusTimeline.push({
        status: "Preparing",
        message: "Payment confirmed! Your order is being prepared 👨‍🍳",
      });
      await order.save();

      const cart = await Cart.findOne({ userId: order.userId });
      if (cart) { cart.items = []; await cart.save(); }

      return res.json({
        success: true,
        message: "Payment successful ✅",
        order: {
          _id: order._id,
          amount: order.amount,
          status: order.status,
          paymentMethod: order.paymentMethod,
          payment: order.payment,
          paymentId: order.paymentId,
          orderTime: order.createdAt,
          estimatedDelivery: order.estimatedDelivery,
          items: order.items.length
        },
        orderTime: order.createdAt
      });
    } else {
      return res.json({ success: false, message: "Payment verification failed ❌" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 📦 Get User Orders
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId })
      .populate("items.foodId", "name price image")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders: orders.map(order => ({
        _id: order._id,
        items: order.items,
        amount: order.amount,
        address: order.address,
        status: order.status,
        paymentMethod: order.paymentMethod,
        payment: order.payment,
        paymentId: order.paymentId,
        statusTimeline: order.statusTimeline,
        estimatedDelivery: order.estimatedDelivery,
        orderTime: order.createdAt,
        updatedAt: order.updatedAt
      }))
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 🔄 Update Order Status (Admin)
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    order.status = status;

    // ✅ COD — sirf Delivered hone par Paid
    if (status === "Delivered" && order.paymentMethod === "COD") {
      order.payment = true;
    }

    const messages = {
      Pending: "Order received ✅",
      Preparing: "Your order is being prepared 👨‍🍳",
      "Out for Delivery": "Order is on the way 🚴",
      Delivered: "Order delivered! Enjoy your meal 🎉",
    };

    order.statusTimeline.push({
      status,
      message: messages[status] || status,
    });

    await order.save();
    res.json({ success: true, message: "Order status updated 🔄" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 📋 Get ALL Orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("items.foodId", "name price image")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders: orders.map(order => ({
        _id: order._id,
        user: {
          name: order.userId?.name || 'Unknown User',
          email: order.userId?.email || 'N/A'
        },
        items: order.items,
        amount: order.amount,
        address: order.address,
        status: order.status,
        paymentMethod: order.paymentMethod,
        payment: order.payment,
        paymentId: order.paymentId,
        statusTimeline: order.statusTimeline,
        estimatedDelivery: order.estimatedDelivery,
        orderTime: order.createdAt,
        updatedAt: order.updatedAt
      }))
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 📍 Get Single Order (Tracking)
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId)
      .populate("items.foodId", "name price image")
      .populate("userId", "name");

    if (!order) return res.json({ success: false, message: "Order not found" });
    if (order.userId._id.toString() !== userId)
      return res.json({ success: false, message: "Unauthorized ❌" });

    res.json({
      success: true,
      order: {
        _id: order._id,
        items: order.items,
        amount: order.amount,
        address: order.address,
        status: order.status,
        paymentMethod: order.paymentMethod,
        payment: order.payment,
        paymentId: order.paymentId,
        statusTimeline: order.statusTimeline,
        estimatedDelivery: order.estimatedDelivery,
        orderTime: order.createdAt,
        updatedAt: order.updatedAt,
        userName: order.userId.name
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 🚫 Cancel Order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });
    if (order.userId.toString() !== userId)
      return res.json({ success: false, message: "Unauthorized ❌" });
    if (order.status !== "Pending")
      return res.json({ success: false, message: "Order cannot be cancelled at this stage" });

    order.status = "Cancelled";
    order.statusTimeline.push({
      status: "Cancelled",
      message: "Order cancelled by user ❌",
    });
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully ❌" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};