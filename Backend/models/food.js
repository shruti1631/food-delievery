import mongoose from "mongoose";

const foodSchema = mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String,
});

const Food = mongoose.models.Food || mongoose.model("Food", foodSchema);

export default Food;