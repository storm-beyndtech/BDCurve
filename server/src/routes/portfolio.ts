import { randomUUID } from "node:crypto";
import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { getMinTradeAmount } from "../services/settings.js";
import { notifyTransaction } from "../services/notifications.js";
import { assetTypeOf, getPriceMap } from "../services/portfolioPrices.js";
import { buildSwapQuote, checkMinimum, computePortfolio, STABLES, SWAP_FEE_RATE } from "../services/portfolio.js";

const router = Router();
router.use(authenticate);

const QUOTE_TTL_MS = 15_000;
type Quote = { id: string; userId: string; from: string; to: string; fromQty: number; fromPrice: number; toPrice: number; toQty: number; grossUsd: number; fee: number; netUsd: number; rate: number; expiresAt: number };
const quotes = new Map<string, Quote>();
const sweep = () => { const now = Date.now(); for (const [k, q] of quotes) if (q.expiresAt < now - 60_000) quotes.delete(k); };

function targetUserId(req: any) {
  const isAdmin = req.user?.isAdmin || req.user?.role === "admin";
  return isAdmin && req.query.userId ? String(req.query.userId) : String(req.user!._id);
}

/** GET /api/portfolio: authoritative portfolio valuation (USD). */
router.get("/", async (req, res) => {
  const userId = targetUserId(req);
  const user = await User.findById(userId).select("assets").lean();
  if (!user) return res.status(404).json({ message: "User not found" });
  const assets = (user.assets || []) as any[];
  const [prices, trades] = await Promise.all([
    getPriceMap(assets.map((a) => String(a.symbol || ""))),
    Transaction.find({ userId, type: "trade" }).select("symbol side quantity price amount status createdAt").lean(),
  ]);
  res.set("Cache-Control", "no-store");
  res.json({ ...computePortfolio(assets, prices, trades as any), pricedAt: new Date().toISOString() });
});

async function makeQuote(userId: string, body: any) {
  const from = String(body.from || "").toUpperCase().trim();
  const to = String(body.to || "USDT").toUpperCase().trim();
  if (!from || !to || from === to) throw Object.assign(new Error("Choose two different assets"), { status: 400 });
  const user = await User.findById(userId).select("assets").lean();
  const holding = (user?.assets || []).find((a: any) => a.symbol === from) as any;
  const available = Number(holding?.spot || 0);
  if (!(available > 0)) throw Object.assign(new Error(`You have no ${from} available to convert`), { status: 400 });
  const percent = Number(body.percent);
  let fromQty = Number.isFinite(percent) && percent > 0 ? (available * Math.min(100, percent)) / 100 : Number(body.amount);
  if (!(fromQty > 0)) throw Object.assign(new Error("Enter an amount"), { status: 400 });
  if (fromQty > available * (1 + 1e-9)) throw Object.assign(new Error(`Insufficient ${from}: you have ${available}`), { status: 400 });
  fromQty = Math.min(fromQty, available);
  const prices = await getPriceMap([from, to]);
  const fromPrice = STABLES.has(from) ? 1 : prices.get(from)?.price || 0;
  const toPrice = STABLES.has(to) ? 1 : prices.get(to)?.price || 0;
  if (!(fromPrice > 0) || !(toPrice > 0)) throw Object.assign(new Error(`A live price is not available for ${!(fromPrice > 0) ? from : to}`), { status: 503 });
  const q = buildSwapQuote(fromQty, fromPrice, toPrice);
  const minTrade = await getMinTradeAmount();
  const minError = checkMinimum(q.grossUsd, fromQty, available, minTrade);
  if (minError) throw Object.assign(new Error(minError), { status: 400, minTradeAmount: minTrade });
  return { id: randomUUID(), userId, from, to, fromQty, fromPrice, toPrice, ...q, expiresAt: Date.now() + QUOTE_TTL_MS, available };
}

/** POST /api/portfolio/quote {from, to="USDT", amount | percent} -> 15s quote */
router.post("/quote", async (req, res) => {
  sweep();
  try {
    const { available, ...quote } = await makeQuote(String(req.user!._id), req.body || {});
    quotes.set(quote.id, quote);
    res.json({
      quoteId: quote.id, from: quote.from, to: quote.to, fromQty: quote.fromQty, available,
      fromPrice: quote.fromPrice, toPrice: quote.toPrice, rate: quote.rate,
      grossUsd: quote.grossUsd, feeRate: SWAP_FEE_RATE, fee: quote.fee, toQty: quote.toQty,
      expiresAt: new Date(quote.expiresAt).toISOString(),
      note: "Executes at the quoted price if confirmed within 15 seconds; otherwise request a new quote.",
    });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || "Quote failed", ...(error.minTradeAmount ? { minTradeAmount: error.minTradeAmount } : {}) });
  }
});

/** POST /api/portfolio/swap {quoteId}: atomic balance move (single conditional update), then two linked trade records. */
router.post("/swap", async (req, res) => {
  const userId = String(req.user!._id);
  const quote = quotes.get(String(req.body?.quoteId || ""));
  if (!quote || quote.userId !== userId) return res.status(400).json({ message: "Quote not found. Please request a new quote." });
  if (quote.expiresAt < Date.now()) { quotes.delete(quote.id); return res.status(409).json({ message: "Quote expired. Please refresh the quote." }); }
  quotes.delete(quote.id); // single use

  // Ensure the destination asset row exists (no-op if present).
  await User.updateOne({ _id: userId, "assets.symbol": { $ne: quote.to } }, { $push: { assets: { symbol: quote.to, name: quote.to, spot: 0, funding: 0 } } });
  // Atomic: debit A only if balance suffices, credit B in the same document update.
  const result = await User.updateOne(
    { _id: userId, assets: { $elemMatch: { symbol: quote.from, spot: { $gte: quote.fromQty - 1e-12 } } } },
    { $inc: { "assets.$[from].spot": -quote.fromQty, "assets.$[to].spot": quote.toQty } },
    { arrayFilters: [{ "from.symbol": quote.from }, { "to.symbol": quote.to }] },
  );
  if (!result.modifiedCount) return res.status(409).json({ message: `Insufficient ${quote.from} balance. Nothing was changed.` });
  // Clamp tiny negative float residue
  await User.updateOne({ _id: userId }, { $set: { "assets.$[f].spot": 0 } }, { arrayFilters: [{ "f.symbol": quote.from, "f.spot": { $lt: 1e-12 } }] });

  const swapId = randomUUID();
  const kind = quote.to === "USDT" ? "convert" : "swap";
  try {
    const metadata = { swapId, kind, rate: quote.rate, fee: quote.fee, feeRate: SWAP_FEE_RATE, orderType: "market" };
    const legs = [];
    if (!STABLES.has(quote.from)) legs.push({ userId, type: "trade", status: "executed", side: "sell", symbol: quote.from, quantity: quote.fromQty, price: quote.fromPrice, amount: quote.grossUsd, fee: quote.fee, assetType: assetTypeOf(quote.from), description: `${kind === "convert" ? "Convert" : "Swap"} ${quote.from} to ${quote.to}`, metadata });
    if (!STABLES.has(quote.to)) legs.push({ userId, type: "trade", status: "executed", side: "buy", symbol: quote.to, quantity: quote.toQty, price: quote.toPrice, amount: quote.netUsd, fee: 0, assetType: assetTypeOf(quote.to), description: `Swap ${quote.from} to ${quote.to}`, metadata });
    const docs = await Transaction.insertMany(legs);
    if (docs[0]) notifyTransaction(docs[0] as any, "executed");
    res.status(201).json({ success: true, swapId, kind, from: quote.from, to: quote.to, fromQty: quote.fromQty, toQty: quote.toQty, fee: quote.fee, transactions: docs });
  } catch (error) {
    // Roll back balances if the history records could not be written.
    await User.updateOne({ _id: userId }, { $inc: { "assets.$[from].spot": quote.fromQty, "assets.$[to].spot": -quote.toQty } }, { arrayFilters: [{ "from.symbol": quote.from }, { "to.symbol": quote.to }] }).catch(() => undefined);
    console.error("[swap] record failed, rolled back:", error instanceof Error ? error.message : error);
    res.status(500).json({ message: "Swap failed and was rolled back. Please try again." });
  }
});

export default router;
