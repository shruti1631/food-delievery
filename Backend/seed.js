import mongoose from "mongoose";
import dotenv from "dotenv";
import Food from "./models/food.js";

dotenv.config();

const foods = [
  { name: "Greek salad", price: 120, category: "Salad", description: "Food provides essential nutrients for overall health and well-being", image: "food_1.png" },
  { name: "Veg salad", price: 180, category: "Salad", description: "Food provides essential nutrients for overall health and well-being", image: "food_2.png" },
  { name: "Clover Salad", price: 160, category: "Salad", description: "Food provides essential nutrients for overall health and well-being", image: "food_3.png" },
  { name: "Chicken Salad", price: 240, category: "Salad", description: "Food provides essential nutrients for overall health and well-being", image: "food_4.png" },
  { name: "Lasagna Rolls", price: 140, category: "Rolls", description: "Food provides essential nutrients for overall health and well-being", image: "food_5.png" },
  { name: "Peri Peri Rolls", price: 120, category: "Rolls", description: "Food provides essential nutrients for overall health and well-being", image: "food_6.png" },
  { name: "Chicken Rolls", price: 200, category: "Rolls", description: "Food provides essential nutrients for overall health and well-being", image: "food_7.png" },
  { name: "Veg Rolls", price: 150, category: "Rolls", description: "Food provides essential nutrients for overall health and well-being", image: "food_8.png" },
  { name: "Ripple Ice Cream", price: 140, category: "Deserts", description: "Food provides essential nutrients for overall health and well-being", image: "food_9.png" },
  { name: "Fruit Ice Cream", price: 220, category: "Deserts", description: "Food provides essential nutrients for overall health and well-being", image: "food_10.png" },
  { name: "Jar Ice Cream", price: 100, category: "Deserts", description: "Food provides essential nutrients for overall health and well-being", image: "food_11.png" },
  { name: "Vanilla Ice Cream", price: 120, category: "Deserts", description: "Food provides essential nutrients for overall health and well-being", image: "food_12.png" },
  { name: "Chicken Sandwich", price: 120, category: "Sandwich", description: "Food provides essential nutrients for overall health and well-being", image: "food_13.png" },
  { name: "Vegan Sandwich", price: 180, category: "Sandwich", description: "Food provides essential nutrients for overall health and well-being", image: "food_14.png" },
  { name: "Grilled Sandwich", price: 160, category: "Sandwich", description: "Food provides essential nutrients for overall health and well-being", image: "food_15.png" },
  { name: "Bread Sandwich", price: 240, category: "Sandwich", description: "Food provides essential nutrients for overall health and well-being", image: "food_16.png" },
  { name: "Cup Cake", price: 140, category: "Cake", description: "Food provides essential nutrients for overall health and well-being", image: "food_17.png" },
  { name: "Vegan Cake", price: 120, category: "Cake", description: "Food provides essential nutrients for overall health and well-being", image: "food_18.png" },
  { name: "Butterscotch Cake", price: 200, category: "Cake", description: "Food provides essential nutrients for overall health and well-being", image: "food_19.png" },
  { name: "Sliced Cake", price: 150, category: "Cake", description: "Food provides essential nutrients for overall health and well-being", image: "food_20.png" },
  { name: "Garlic Mushroom", price: 140, category: "Pure Veg", description: "Food provides essential nutrients for overall health and well-being", image: "food_21.png" },
  { name: "Fried Cauliflower", price: 220, category: "Pure Veg", description: "Food provides essential nutrients for overall health and well-being", image: "food_22.png" },
  { name: "Mix Veg Pulao", price: 100, category: "Pure Veg", description: "Food provides essential nutrients for overall health and well-being", image: "food_23.png" },
  { name: "Rice Zucchini", price: 120, category: "Pure Veg", description: "Food provides essential nutrients for overall health and well-being", image: "food_24.png" },
  { name: "Cheese Pasta", price: 120, category: "Pasta", description: "Food provides essential nutrients for overall health and well-being", image: "food_25.png" },
  { name: "Tomato Pasta", price: 180, category: "Pasta", description: "Food provides essential nutrients for overall health and well-being", image: "food_26.png" },
  { name: "Creamy Pasta", price: 160, category: "Pasta", description: "Food provides essential nutrients for overall health and well-being", image: "food_27.png" },
  { name: "Chicken Pasta", price: 240, category: "Pasta", description: "Food provides essential nutrients for overall health and well-being", image: "food_28.png" },
  { name: "Butter Noodles", price: 140, category: "Noodles", description: "Food provides essential nutrients for overall health and well-being", image: "food_29.png" },
  { name: "Veg Noodles", price: 120, category: "Noodles", description: "Food provides essential nutrients for overall health and well-being", image: "food_30.png" },
  { name: "Somen Noodles", price: 200, category: "Noodles", description: "Food provides essential nutrients for overall health and well-being", image: "food_31.png" },
  { name: "Cooked Noodles", price: 150, category: "Noodles", description: "Food provides essential nutrients for overall health and well-being", image: "food_32.png" },
]

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected ✅")
    await Food.deleteMany({})
    console.log("Old data cleared 🗑️")
    await Food.insertMany(foods)
    console.log(`${foods.length} food items added ✅`)
    mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
}

seedDB()