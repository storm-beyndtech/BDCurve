import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSwapQuote, checkMinimum, computePortfolio, costBasisFromTrades, type PriceInfo } from "../src/services/portfolio.js";

const prices = new Map<string, PriceInfo>([
  ["BTC", { price: 50_000, changePercent: 10, type: "crypto", name: "Bitcoin" }],
  ["AAPL", { price: 200, changePercent: -5, type: "stock", name: "Apple" }],
]);

test("values cash, crypto and stocks in USD and sums spot + funding", () => {
  const p = computePortfolio([
    { symbol: "USDT", spot: 100, funding: 50 },
    { symbol: "BTC", spot: 0.01, funding: 0.01 },
    { symbol: "AAPL", spot: 2 },
  ], prices);
  assert.equal(p.totalValue, 150 + 1000 + 400);
  assert.equal(p.cashValue, 150);
  assert.equal(p.investedValue, 1400);
  assert.equal(p.buyingPower, 100); // only spot USDT is tradable
  assert.deepEqual(p.holdings.map((h) => h.symbol), ["BTC", "AAPL", "USDT"]);
  assert.equal(p.holdings.find((h) => h.symbol === "AAPL")!.type, "stock");
  const alloc = p.holdings.reduce((s, h) => s + h.allocation, 0);
  assert.ok(Math.abs(alloc - 100) < 0.05);
});

test("unpriced assets are reported, valued 0, never NaN; zero/negative/null rows ignored", () => {
  const p = computePortfolio([
    { symbol: "XYZ", spot: 5 },
    { symbol: "ETH", spot: 0 },
    { symbol: "BTC", spot: -1 },
    { symbol: null, spot: 3 },
    { symbol: "usdt", spot: null as any, funding: 10 },
  ], prices);
  assert.equal(p.totalValue, 10);
  assert.deepEqual(p.unpricedSymbols, ["XYZ"]);
  assert.ok(p.holdings.every((h) => Number.isFinite(h.value)));
});

test("duplicate symbol rows are merged, not double counted", () => {
  const p = computePortfolio([{ symbol: "BTC", spot: 0.01 }, { symbol: "BTC", spot: 0.01 }], prices);
  assert.equal(p.holdings.length, 1);
  assert.equal(p.totalValue, 1000);
});

test("24h change uses start-of-day value; stablecoins contribute none", () => {
  const p = computePortfolio([{ symbol: "BTC", spot: 0.022 }, { symbol: "USDT", spot: 900 }], prices);
  // BTC value 1100 now, was 1000 => +100
  assert.equal(p.dayChange, 100);
  assert.equal(p.dayChangePercent, Number(((100 / 1900) * 100).toFixed(2)));
});

test("average cost basis and unrealised P&L from executed trades only", () => {
  const trades = [
    { symbol: "BTC", side: "buy", quantity: 0.02, amount: 800, status: "executed", createdAt: "2026-01-01" },
    { symbol: "BTC", side: "sell", quantity: 0.01, amount: 450, status: "executed", createdAt: "2026-01-02" },
    { symbol: "BTC", side: "buy", quantity: 1, amount: 1, status: "pending", createdAt: "2026-01-03" },
  ];
  const book = costBasisFromTrades(trades);
  assert.equal(book.get("BTC")!.qty, 0.01);
  assert.equal(Math.round(book.get("BTC")!.cost), 400);
  const p = computePortfolio([{ symbol: "BTC", spot: 0.01 }], prices, trades);
  const h = p.holdings[0];
  assert.equal(h.costBasis, 400);
  assert.equal(h.pnl, 100);
  assert.equal(h.pnlPercent, 25);
});

test("swap quote applies fee and converts at USD cross rate", () => {
  const q = buildSwapQuote(0.01, 50_000, 2_500, 0.001);
  assert.equal(q.grossUsd, 500);
  assert.equal(q.fee, 0.5);
  assert.equal(q.toQty, 499.5 / 2500);
  assert.equal(q.rate, 20);
  assert.throws(() => buildSwapQuote(0, 1, 1));
});

test("minimum rule: enforced below min except when converting the entire balance", () => {
  assert.equal(checkMinimum(150, 1, 5, 100), null);
  assert.match(String(checkMinimum(20, 1, 5, 100)), /Minimum/);
  assert.equal(checkMinimum(20, 5, 5, 100), null); // Max / full balance allowed
});

// ---- Audit regressions (Oct 2026) ----
import { depositCreditQuantity } from "../src/services/portfolio.js";

test("deposit of $500 in BTC credits coin units, not 500 BTC", () => {
  // Bug: approval credited the USD figure as coin units -> 500 BTC (~$33.5M at $67k)
  assert.equal(depositCreditQuantity("BTC", 500, 67_000), Number((500 / 67_000).toFixed(10)));
  assert.equal(depositCreditQuantity("USDT", 500, undefined), 500);
  assert.equal(depositCreditQuantity("ETH", 500, 0), null); // no price -> refuse, never guess
  assert.equal(depositCreditQuantity("ETH", 0, 3000), null);
});

test("P&L uses traded quantity only; deposited units are not given the trade cost", () => {
  // Bought 0.01 BTC @ 40k ($400), later deposited 0.09 BTC (no cost record). Price now 50k.
  const p = computePortfolio([{ symbol: "BTC", spot: 0.1 }], prices, [
    { symbol: "BTC", side: "buy", quantity: 0.01, amount: 400, status: "executed", createdAt: "2026-01-01" },
  ]);
  const h = p.holdings[0];
  assert.equal(h.value, 5000);
  assert.equal(h.costBasis, 400);
  assert.equal(h.pnl, 100); // 0.01 * 50k - 400 (old code: 5000 - 4000 = +1000)
  assert.equal(h.pnlPercent, 25);
});

test("unpriced holdings are never flagged dust (so not hidden by Hide <$1)", () => {
  const p = computePortfolio([{ symbol: "XYZ", spot: 1000 }, { symbol: "BTC", spot: 0.00001 }], prices);
  const xyz = p.holdings.find((h) => h.symbol === "XYZ")!;
  assert.equal(xyz.priced, false);
  assert.equal(xyz.dust, false);
  assert.deepEqual(p.unpricedSymbols, ["XYZ"]);
  assert.equal(p.holdings.find((h) => h.symbol === "BTC")!.dust, true); // $0.50
});

test("tiny-price coins, negatives, NaN and duplicates: total equals sum of rows, allocation ~100", () => {
  const px = new Map<string, PriceInfo>([
    ...prices,
    ["PEPE", { price: 0.0000089, changePercent: -3.2, type: "crypto" }],
    ["SHIB", { price: 0.00001412, changePercent: 1.1, type: "crypto" }],
  ]);
  const p = computePortfolio([
    { symbol: "PEPE", spot: 50_000_000 },
    { symbol: "shib", spot: 10_000_000, funding: NaN as any },
    { symbol: "SHIB", spot: -5 },
    { symbol: "USDT", spot: 250.5, funding: -10 },
    { symbol: "ETH", spot: 0 },
  ], px);
  const rows = p.holdings.reduce((s, h) => s + h.value, 0);
  assert.ok(Math.abs(p.totalValue - rows) < 0.01);
  assert.equal(p.totalValue, 445 + 141.2 + 250.5);
  assert.ok(p.holdings.every((h) => Number.isFinite(h.value) && h.quantity > 0));
  const alloc = p.holdings.reduce((s, h) => s + h.allocation, 0);
  assert.ok(Math.abs(alloc - 100) <= 0.05, String(alloc));
  assert.ok(!p.holdings.some((h) => h.symbol === "ETH"));
});

test("swap legs keep basis consistent: sell BTC leg removes its basis proportionally", () => {
  const b = costBasisFromTrades([
    { symbol: "BTC", side: "buy", quantity: 0.02, amount: 800, status: "executed", createdAt: "2026-01-01" },
    { symbol: "BTC", side: "sell", quantity: 0.01, amount: 600, status: "executed", createdAt: "2026-02-01" },
    { symbol: "BTC", side: "buy", quantity: 1, amount: 50_000, status: "pending", createdAt: "2026-03-01" },
  ]);
  assert.deepEqual(b.get("BTC"), { qty: 0.01, cost: 400 });
});
