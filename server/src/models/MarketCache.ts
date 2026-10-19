import { Schema, model } from "mongoose";

const marketSnapshotSchema = new Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true, index: true },
  quote: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

const marketHistoryCacheSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  payload: { type: Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

export const MarketSnapshot = model("MarketSnapshot", marketSnapshotSchema);
export const MarketHistoryCache = model("MarketHistoryCache", marketHistoryCacheSchema);
