import dotenv from "dotenv";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";

dotenv.config({ quiet: true });

async function verifyMongo() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  await mongoose.disconnect();
}

async function verifySmtp() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  await transporter.verify();
  transporter.close();
}

async function verifyCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  await cloudinary.api.ping();
}

const checks = [
  ["MongoDB", verifyMongo],
  ["SMTP", verifySmtp],
  ["Cloudinary", verifyCloudinary],
];

let failed = false;
for (const [name, verify] of checks) {
  try {
    await verify();
    console.log(`${name}: connected`);
  } catch (error) {
    failed = true;
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`${name}: failed - ${message}`);
  }
}

if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
if (failed) process.exitCode = 1;
