import express from "express";
import multer from "multer";
import path from "path";
import { addFood, getFoods, deleteFood } from "../controllers/foodController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const upload = multer({ storage })

router.get("/list", getFoods);
router.post("/add", upload.single('image'), addFood);
router.get("/admin/list", auth, getFoods);
router.post("/delete", auth, deleteFood);

export default router;