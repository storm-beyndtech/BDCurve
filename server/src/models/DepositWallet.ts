import { Schema, model } from "mongoose";

/** Platform deposit wallet: where users send a given coin on a given network. Single source of truth for deposit addresses. */
const depositWalletSchema = new Schema({
  symbol: { type: String, required: true, uppercase: true, trim: true, index: true },
  network: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  label: { type: String, default: "", trim: true },
  memo: { type: String, default: "", trim: true },
  minDeposit: { type: Number, default: 0, min: 0 },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

depositWalletSchema.index({ symbol: 1, network: 1 }, { unique: true });

export const DepositWallet = model("DepositWallet", depositWalletSchema);
