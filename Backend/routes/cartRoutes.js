import express from "express";
import { addToCart, removeFromCart, getCart } from "../controllers/cartController.js";
import auth from "../middleware/auth.js";

const router = express.Router();


//  Add item to cart
//  Body: { foodId, quantity }
//  Token required
router.post("/add", auth, addToCart);


// Remove item from cart
//  Body: { foodId }
router.post("/remove", auth, removeFromCart);


//  Get cart data
//  Logged-in user ka cart milega
router.get("/get", auth, getCart);


//  BONUS → Clear full cart
//  Sare items delete ho jayenge
router.post("/clear", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const Cart = (await import("../models/cart.js")).default;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found ",
      });
    }

    cart.items = []; // cart empty
    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully 🧹",
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});


export default router;