import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";

connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

app.use("/uploads", express.static("uploads"));

// ✅ Admin Panel
app.use("/admin", express.static(path.join(__dirname, "../Admin/dist")));
app.get("/admin/*path", (req, res) => {
  res.sendFile(path.join(__dirname, "../Admin/dist/index.html"));
});

// ✅ Frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/notify", notificationRoutes);
app.use("/api/restaurant", restaurantRoutes);

app.get("/api", (req, res) => {
  res.send("API Running ✅");
});

// ✅ Frontend React Router
app.get("/*path", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`✅ Frontend: http://localhost:${PORT}`);
  console.log(`✅ Admin: http://localhost:${PORT}/admin`);
});