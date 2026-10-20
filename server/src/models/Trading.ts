import { Schema, model } from "mongoose";

const traderSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, lowercase: true },
  bio: String,
  profileImage: String,
  profileImagePublicId: String,
  experience: { type: Number, default: 1 },
  specialization: String,
  specialties: { type: [String], default: [] },
  tradingStyle: String,
  riskLevel: String,
  totalTrades: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  totalCopiers: { type: Number, default: 0 },
  profitPercentage: { monthly: { type: Number, default: 0 }, yearly: { type: Number, default: 0 } },
  averageHoldingTime: String,
  minimumCopyAmount: { type: Number, default: 100 },
  copierFee: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

const liveTradeSchema = new Schema({
  symbol: { type: String, required: true, uppercase: true },
  category: { type: String, required: true },
  expectedProfit: { type: Number, required: true },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  openedAt: { type: Date, default: Date.now },
  closedAt: Date,
}, { timestamps: true });

export const Trader = model("Trader", traderSchema);
export const LiveTrade = model("LiveTrade", liveTradeSchema);
