import { defaultCoins, defaultStocks } from "../config/catalogue.js";
import { getCryptoQuotes, getStockQuote, getStockSnapshots, marketData } from "./marketData.js";
import { STABLES, type PriceInfo } from "./portfolio.js";

const coinSet = new Set(defaultCoins.map((c) => c.symbol));
const stockSet = new Set(defaultStocks.map((s) => s.symbol));
const nameOf = (sym: string) => defaultCoins.find((c) => c.symbol === sym)?.name || defaultStocks.find((s) => s.symbol === sym)?.name;

/** Crypto first (catalogue coins), then stocks; unknown symbols try crypto then stock. Never throws; missing => absent. */
export async function getPriceMap(symbols: string[]): Promise<Map<string, PriceInfo>> {
  const out = new Map<string, PriceInfo>();
  const syms = [...new Set(symbols.map((s) => s.toUpperCase()))].filter((s) => s && !STABLES.has(s));
  const cryptos = syms.filter((s) => coinSet.has(s) || !stockSet.has(s));
  const stocks = syms.filter((s) => stockSet.has(s) && !coinSet.has(s));

  if (cryptos.length) {
    try {
      const payload = (await Promise.race([getCryptoQuotes(cryptos), new Promise((r) => setTimeout(() => r({}), 5000))])) as any;
      for (const s of cryptos) {
        const raw = payload?.[s]?.USD;
        if (raw?.PRICE > 0) out.set(s, { price: Number(raw.PRICE), changePercent: Number(raw.CHANGEPCT24HOUR) || 0, type: "crypto", name: nameOf(s) });
      }
    } catch { /* fall through to cache */ }
    for (const s of cryptos) {
      if (out.has(s)) continue;
      const q = marketData.getQuote(s);
      if (q?.price) out.set(s, { price: q.price, changePercent: q.changePercent || 0, type: "crypto", name: nameOf(s) });
    }
  }
  // Unknown symbols that were not crypto-priced might be stocks
  const stockTargets = [...stocks, ...cryptos.filter((s) => !out.has(s) && !coinSet.has(s))];
  if (stockTargets.length) {
    try {
      const snaps = await getStockSnapshots(stockTargets, 3500);
      for (const s of stockTargets) {
        const snap = snaps.get(s);
        if (snap?.price) out.set(s, { price: snap.price, changePercent: snap.changePercent, type: "stock", name: nameOf(s) });
      }
    } catch { /* ignore */ }
    await Promise.all(stockTargets.filter((s) => !out.has(s)).slice(0, 5).map(async (s) => {
      try {
        const q = await getStockQuote(s);
        if (q.price > 0) out.set(s, { price: q.price, changePercent: q.changePercent || 0, type: "stock", name: nameOf(s) });
      } catch { /* unpriced */ }
    }));
  }
  return out;
}

export const assetTypeOf = (sym: string): "cash" | "crypto" | "stock" => (STABLES.has(sym) ? "cash" : stockSet.has(sym) && !coinSet.has(sym) ? "stock" : "crypto");
