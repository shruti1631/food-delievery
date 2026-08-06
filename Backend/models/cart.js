import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  items: [
    {
      foodId: String,
      quantity: Number,
    },
  ],
});

export default mongoose.model("Cart", cartSchema);