import express from "express";
import { subscribe, sendNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/events", subscribe);
router.post("/send", sendNotification);

export default router;