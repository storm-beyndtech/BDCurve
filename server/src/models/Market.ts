import { Schema, model } from "mongoose";

const coinSchema = new Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  network: { type: String, default: "" },
  address: { type: String, default: "" },
  deposit: { type: Boolean, default: true },
  withdraw: { type: Boolean, default: true },
  minDeposit: { type: Number, default: 0 },
  minWithdraw: { type: Number, default: 10 },
  withdrawalFee: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  changePercent: { type: Number, default: 0 },
  logo: String,
}, { timestamps: true });

const stockSchema = new Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  change: { type: Number, default: 0 },
  changePercent: { type: Number, default: 0 },
  logo: String,
  description: String,
  exchange: String,
  industry: String,
}, { timestamps: true });

export const Coin = model("Coin", coinSchema);
export const Stock = model("Stock", stockSchema);
