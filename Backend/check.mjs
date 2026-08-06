import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const Order = (await import('./models/Order.js')).default;

const orders = await Order.find({ paymentMethod: 'COD' }).limit(5);
orders.forEach(o => console.log('Payment:', o.payment, '| Status:', o.status));

await mongoose.disconnect();