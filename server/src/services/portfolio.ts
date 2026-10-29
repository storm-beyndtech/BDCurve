/**
 * Pure portfolio maths (no I/O) so it can be unit-tested.
 * Valuation currency: USD, with USDT/USDC/USD pegged at 1.
 */
export const STABLES = new Set(["USDT", "USDC", "USD"]);
export const SWAP_FEE_RATE = 0.001; // 0.1% per conversion/swap
export const DUST_USD = 1;

export type AssetType = "cash" | "crypto" | "stock";
export type RawAsset = { symbol?: string | null; name?: string | null; spot?: number | null; funding?: number | null };
export type PriceInfo = { price: number; changePercent?: number; name?: string; type: AssetType };
export type TradeTx = { symbol?: string | null; side?: string | null; quantity?: number | null; price?: number | null; amount?: number | null; status?: string | null; createdAt?: Date | string | null };

export type Holding = {
  symbol: string; name: string; type: AssetType;
  quantity: number; spot: number; funding: number;
  price: number; value: number; allocation: number; change24h: number; dayChange: number;
  priced: boolean; dust: boolean;
  costBasis: number | null; avgCost: number | null; pnl: number | null; pnlPercent: number | null;
};

const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/** Average-cost basis from executed/filled trades, in chronological order. Sells reduce basis proportionally. */
export function costBasisFromTrades(trades: TradeTx[]) {
  const sorted = [...trades]
    .filter((t) => ["executed", "completed", "approved", "closed"].includes(String(t.status || "")))
    .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
  const book = new Map<string, { qty: number; cost: number }>();
  for (const t of sorted) {
    const sym = String(t.symbol || "").toUpperCase();
    const qty = num(t.quantity);
    if (!sym || qty <= 0 || STABLES.has(sym)) continue;
    const entry = book.get(sym) || { qty: 0, cost: 0 };
    const side = String(t.side || "").toLowerCase();
    if (side === "buy") {
      entry.cost += num(t.amount) || qty * num(t.price);
      entry.qty += qty;
    } else if (side === "sell" && entry.qty > 0) {
      const sold = Math.min(qty, entry.qty);
      entry.cost -= entry.cost * (sold / entry.qty);
      entry.qty -= sold;
    }
    book.set(sym, entry);
  }
  return book;
}

export function computePortfolio(assets: RawAsset[], prices: Map<string, PriceInfo>, trades: TradeTx[] = []) {
  const basis = costBasisFromTrades(trades);
  // Merge duplicate symbol rows (defensive: older docs could contain duplicates)
  const merged = new Map<string, { name: string; spot: number; funding: number }>();
  for (const a of assets || []) {
    const sym = String(a?.symbol || "").toUpperCase().trim();
    if (!sym) continue;
    const prev = merged.get(sym) || { name: String(a.name || sym), spot: 0, funding: 0 };
    prev.spot += Math.max(0, num(a.spot));
    prev.funding += Math.max(0, num(a.funding));
    merged.set(sym, prev);
  }

  const holdings: Holding[] = [];
  for (const [symbol, a] of merged) {
    const quantity = a.spot + a.funding;
    if (quantity <= 0) continue;
    const stable = STABLES.has(symbol);
    const info = stable ? { price: 1, changePercent: 0, type: "cash" as const, name: a.name } : prices.get(symbol);
    const price = info && info.price > 0 ? info.price : 0;
    const value = quantity * price;
    const change24h = stable ? 0 : num(info?.changePercent);
    const dayChange = price > 0 && change24h ? value - value / (1 + change24h / 100) : 0;
    const b = basis.get(symbol);
    // Basis is only known for units acquired through trades; deposited/credited units have no cost record,
    // so P&L is measured on the tracked quantity only (never extrapolated onto deposits).
    const tracked = b && b.qty > 0 ? Math.min(b.qty, quantity) : 0;
    const avgCost = tracked > 0 ? b!.cost / b!.qty : null;
    const costBasis = avgCost !== null ? avgCost * tracked : null;
    const pnl = costBasis !== null && price > 0 ? tracked * price - costBasis : null;
    holdings.push({
      symbol, name: info?.name || a.name || symbol, type: stable ? "cash" : info?.type || "crypto",
      quantity, spot: a.spot, funding: a.funding,
      price, value, allocation: 0, change24h, dayChange,
      priced: price > 0, dust: price > 0 && value < DUST_USD,
      costBasis: costBasis !== null ? round(costBasis) : null,
      avgCost: avgCost !== null ? avgCost : null,
      pnl: pnl !== null ? round(pnl) : null,
      pnlPercent: pnl !== null && costBasis ? round((pnl / costBasis) * 100) : null,
    });
  }

  const totalValue = holdings.reduce((s, h) => s + h.value, 0);
  for (const h of holdings) h.allocation = totalValue > 0 ? round((h.value / totalValue) * 100) : 0;
  holdings.sort((x, y) => y.value - x.value);
  const cashValue = holdings.filter((h) => h.type === "cash").reduce((s, h) => s + h.value, 0);
  const dayChange = holdings.reduce((s, h) => s + h.dayChange, 0);
  const prevValue = totalValue - dayChange;
  const withBasis = holdings.filter((h) => h.pnl !== null);
  return {
    currency: "USD",
    totalValue: round(totalValue),
    cashValue: round(cashValue),
    investedValue: round(totalValue - cashValue),
    buyingPower: round(holdings.filter((h) => h.type === "cash").reduce((s, h) => s + h.spot, 0)),
    dayChange: round(dayChange),
    dayChangePercent: prevValue > 0 ? round((dayChange / prevValue) * 100) : 0,
    unrealizedPnl: withBasis.length ? round(withBasis.reduce((s, h) => s + (h.pnl || 0), 0)) : null,
    unpricedSymbols: holdings.filter((h) => !h.priced).map((h) => h.symbol),
    holdings,
  };
}

/**
 * Deposits are entered in USD on the deposit form. Credit the coin in COIN UNITS:
 * stables 1:1, anything else usdAmount / price. Returns null when no valid price.
 */
export function depositCreditQuantity(symbol: string, usdAmount: number, price: number | null | undefined) {
  if (!(usdAmount > 0)) return null;
  if (STABLES.has(String(symbol).toUpperCase())) return usdAmount;
  return price && price > 0 ? Number((usdAmount / price).toFixed(10)) : null;
}

/** Quote for selling `fromQty` of A into B at given USD prices. */
export function buildSwapQuote(fromQty: number, fromPrice: number, toPrice: number, feeRate = SWAP_FEE_RATE) {
  if (!(fromQty > 0) || !(fromPrice > 0) || !(toPrice > 0)) throw new Error("Invalid quote inputs");
  const grossUsd = fromQty * fromPrice;
  const fee = grossUsd * feeRate;
  const netUsd = grossUsd - fee;
  return { grossUsd, fee, netUsd, toQty: netUsd / toPrice, rate: fromPrice / toPrice };
}

/**
 * Platform minimum applies to conversions/swaps, except selling the ENTIRE holding
 * (so small "dust" balances can always be cleaned up into USDT or another asset).
 */
export function checkMinimum(usdValue: number, fromQty: number, available: number, minTrade: number) {
  const isFullBalance = available > 0 && Math.abs(available - fromQty) <= Math.max(1e-12, available * 1e-9);
  if (usdValue >= minTrade || isFullBalance) return null;
  return `Minimum is $${minTrade.toFixed(2)} unless you convert your entire balance (use Max).`;
}
