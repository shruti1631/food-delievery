import Restaurant from "../models/restaurant.js";
import fs from "fs";

// Add Restaurant
export const addRestaurant = async (req, res) => {
  try {
    const { name, description, address, cuisine, rating } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !address || !cuisine || !image) {
      return res.json({
        success: false,
        message: "Name, address, cuisine aur image sab required hain ❌",
      });
    }

    const restaurant = new Restaurant({
      name,
      description,
      address,
      cuisine,
      image,
      rating: rating ? Number(rating) : 0,
    });

    await restaurant.save();

    res.json({
      success: true,
      message: "Restaurant added successfully ✅",
      data: restaurant,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all Restaurants
export const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete Restaurant
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.json({ success: false, message: "Restaurant ID required ❌" });
    }

    const restaurant = await Restaurant.findById(id);
    if (restaurant && restaurant.image) {
      const imagePath = `uploads/${restaurant.image}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Restaurant.findByIdAndDelete(id);
    res.json({ success: true, message: "Restaurant deleted successfully ✅" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Toggle Active/Inactive
export const toggleRestaurant = async (req, res) => {
  try {
    const { id } = req.body;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.json({ success: false, message: "Restaurant not found ❌" });
    }
    restaurant.isActive = !restaurant.isActive;
    await restaurant.save();
    res.json({
      success: true,
      message: `Restaurant ${restaurant.isActive ? "activated" : "deactivated"} ✅`,
      data: restaurant,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};