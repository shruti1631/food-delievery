import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
        },
        quantity: Number,
        price: Number, // ✅ FIX: price bhi store karo taaki order history mein sahi amount dikhe
      },
    ],

    amount: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "Pending", // Pending → Preparing → Out for Delivery → Delivered
    },

    paymentMethod: {
      type: String,
      enum: ["ONLINE", "COD"],
      default: "COD",
    },

    payment: {
      type: Boolean,
      default: false,
    },

    paymentId: {
      type: String,
    },

    // 📍 Order Tracking Fields
    statusTimeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        message: String,
      },
    ],

    estimatedDelivery: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);