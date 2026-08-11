#  ZestyBite — Full Stack Food Delivery App

A full-stack food delivery web application built with the MERN stack (MongoDB, Express, React, Node.js). Users can browse a menu, get AI-powered mood-based food recommendations, place orders (Cash on Delivery or online via Razorpay), and track order status in real time. Includes a separate admin dashboard for managing food items, restaurants, and orders.

##  Features

### User side
- Sign up / login with **email or phone number** (either one works)
- **OTP verification** via SMS on phone signup (Fast2SMS)
- Forgot password / reset password flow
- Browse food by category, search menu
- **AI Mood Engine** — recommends real menu items based on mood + food preference
- Cart with live quantity management
- Checkout with **Cash on Delivery** or **Online Payment (Razorpay)**
- Order tracking with live status timeline
- Order history

### Admin side
- Secure admin login
- Add / edit / remove food items
- Add / manage restaurants
- View and update order status (Pending → Preparing → Out for Delivery → Delivered)
- Real-time notifications for new orders

---

## 🛠️ Tech Stack

**Frontend:** React (Vite), React Router, Context API
**Admin Panel:** React (Vite)
**Backend:** Node.js, Express
**Database:** MongoDB (Mongoose)
**Auth:** JWT, bcrypt password hashing
**Payments:** Razorpay
**SMS/OTP:** Fast2SMS

---

## 📁 Project Structure

```
food-delievery/
├── Backend/        # Express API server
├── frontend/       # Customer-facing React app
├── Admin/          # Admin dashboard React app
└── README.md
```

---

##  Getting Started (Local Setup)

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account (or local MongoDB)
- A Razorpay account (test mode is fine)
- (Optional) A Fast2SMS account for real OTP delivery

### 1. Clone the repo
```bash
git clone https://github.com/shruti1631/food-delievery.git
cd food-delievery
```

### 2. Backend setup
```bash
cd Backend
npm install
```
Copy `.env.example` to `.env` and fill in your own values:
```bash
cp .env.example .env
```
Then run:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Admin panel setup
```bash
cd ../Admin
npm install
npm run dev
```

### 5. Seed sample food data (first time only)
```bash
cd ../Backend
node seed.js
```

---

## 🔐 Environment Variables

Create a `.env` file inside `Backend/` (see `.env.example` for the full list):

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay test/live API keys |
| `FAST2SMS_API_KEY` | For sending OTP via SMS (optional in dev — OTP prints to console if not set) |
| `PORT` | Backend server port (default 5000) |

> ⚠️ Never commit your real `.env` file. It's already excluded via `.gitignore`.

---

## 📌 Notes

- In development, the frontend runs on its own dev server (`localhost:5173`) for hot-reloading. To serve everything from a single host (`localhost:5000`), run `npm run build` inside both `frontend/` and `Admin/` — the backend serves the built files automatically.
- If `FAST2SMS_API_KEY` isn't set, OTPs are printed to the backend terminal instead of being sent via SMS — useful for local testing without spending SMS credits.

---

## 📄 License

This project is for educational/portfolio purposes.
