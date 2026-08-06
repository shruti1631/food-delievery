import express from "express";
import multer from "multer";
import {
  addRestaurant,
  getRestaurants,
  deleteRestaurant,
  toggleRestaurant,
} from "../controllers/restaurantController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.get("/list", getRestaurants);
router.post("/add", auth, upload.single("image"), addRestaurant);
router.post("/delete", auth, deleteRestaurant);
router.post("/toggle", auth, toggleRestaurant);

export default router;