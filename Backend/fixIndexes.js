// One-time script: rebuilds the User collection's indexes so that
// email/phone become properly "sparse unique" (optional but unique when given).
// Run this ONCE after updating models/User.js:
//   node fixIndexes.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    console.log("🔎 Current indexes before fix:");
    const before = await User.collection.indexes();
    console.log(before);

    console.log("🛠  Syncing indexes with current schema...");
    const result = await User.syncIndexes();
    console.log("✅ Sync result:", result);

    console.log("🔎 Indexes after fix:");
    const after = await User.collection.indexes();
    console.log(after);

    console.log("🎉 Done! email/phone are now optional + unique-when-provided.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing indexes:", error);
    process.exit(1);
  }
};

run();