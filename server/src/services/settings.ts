import { Setting } from "../models/Setting.js";

export const DEFAULT_MIN_TRADE_AMOUNT = Number(process.env.MIN_TRADE_AMOUNT_USD) > 0 ? Number(process.env.MIN_TRADE_AMOUNT_USD) : 10;

let cache: { value: number; expiresAt: number } | undefined;

/** Platform-wide minimum order value in USD (applies to every asset). */
export async function getMinTradeAmount(): Promise<number> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;
  try {
    const row = await Setting.findOne({ key: "minTradeAmount" }).lean();
    const value = Number(row?.value);
    const resolved = Number.isFinite(value) && value >= 0 ? value : DEFAULT_MIN_TRADE_AMOUNT;
    cache = { value: resolved, expiresAt: Date.now() + 60_000 };
    return resolved;
  } catch {
    return cache?.value ?? DEFAULT_MIN_TRADE_AMOUNT;
  }
}

export async function setMinTradeAmount(value: number) {
  await Setting.findOneAndUpdate({ key: "minTradeAmount" }, { key: "minTradeAmount", value }, { upsert: true });
  cache = { value, expiresAt: Date.now() + 60_000 };
  return value;
}
