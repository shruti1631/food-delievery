import Food from "../models/food.js";
import fs from "fs";

// ✅ Add food — image req.file se aayegi (multer)
export const addFood = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    // Image multer se aayegi
    const image = req.file ? req.file.filename : null;

    if (!name || !price || !category || !image) {
      return res.json({
        success: false,
        message: "All fields required including image",
      });
    }

    const food = new Food({
      name,
      price: Number(price),
      category,
      image,
      description,
    });

    await food.save();

    res.json({
      success: true,
      message: "Food added successfully ✅",
      data: food,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get all foods
export const getFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Delete food — image bhi uploads folder se delete hogi
export const deleteFood = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.json({
        success: false,
        message: "Food ID required ❌",
      });
    }

    // Food find karo
    const food = await Food.findById(id);

    // Image file bhi delete karo
    if (food && food.image) {
      const imagePath = `uploads/${food.image}`;

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Food database se delete karo
    await Food.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Food Deleted Successfully ✅",
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};