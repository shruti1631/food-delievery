import express from "express";
import { register, login, forgotPassword, resetPassword, sendOtp, verifyOtp } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.get("/", (req, res) => {
  console.log("User route hit");
  res.send("User route working");
});

export default router;