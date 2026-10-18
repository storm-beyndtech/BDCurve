import { Schema, model } from "mongoose";

const otpSchema = new Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  codeHash: { type: String, required: true },
  purpose: { type: String, enum: ["registration", "password-reset"], required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { timestamps: true });

export const Otp = model("Otp", otpSchema);
