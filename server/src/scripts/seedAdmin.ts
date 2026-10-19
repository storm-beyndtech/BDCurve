import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

const email = String(process.env.ADMIN_SEED_EMAIL || "").trim().toLowerCase();
const password = String(process.env.ADMIN_SEED_PASSWORD || "");

if (!email || !password) {
  throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required");
}

if (password.length < 12) {
  throw new Error("The admin seed password must contain at least 12 characters");
}

try {
  await mongoose.connect(env.MONGODB_URI);
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        passwordHash,
        role: "admin",
        isAdmin: true,
        isVerified: true,
        accountStatus: "active",
      },
      $setOnInsert: {
        firstName: "Bounding Curve",
        lastName: "Support",
        name: { first: "Bounding Curve", last: "Support", full: "Bounding Curve Support" },
        onboardingCompleted: true,
      },
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );

  console.info(`Admin account ready: ${admin.email}`);
} finally {
  await mongoose.disconnect();
}
