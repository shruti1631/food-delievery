import mongoose from "mongoose";

const foodSchema = mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String,
});

// ✅ Fix — pehle check karo model exist karta hai ya nahi
const Food = mongoose.models.Food || mongoose.model("Food", foodSchema);

export default Food;