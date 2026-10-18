import { Schema, model } from "mongoose";

const transactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["deposit", "withdrawal", "trade", "profit"], required: true, index: true },
  status: { type: String, enum: ["pending", "processing", "approved", "completed", "rejected", "cancelled", "open", "closed", "executed"], default: "pending" },
  amount: { type: Number, required: true },
  symbol: { type: String, uppercase: true },
  network: String,
  address: String,
  fee: { type: Number, default: 0 },
  description: String,
  side: String,
  quantity: Number,
  price: Number,
  assetType: String,
  metadata: Schema.Types.Mixed,
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date,
}, { timestamps: true });

export const Transaction = model("Transaction", transactionSchema);
