import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const Order = (await import('./models/Order.js')).default;

const result = await Order.updateMany(
  { paymentMethod: 'COD', payment: false },
  { $set: { payment: true } }
);

console.log('Updated orders:', result.modifiedCount);
await mongoose.disconnect();