import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";
import { getMarketPrice } from "../services/marketData.js";
import { getMinTradeAmount } from "../services/settings.js";
import { Coin } from "../models/Market.js";
import { defaultCoins } from "../config/catalogue.js";

/** Effective coin config = catalogue default overlaid with the admin DB row (same merge as GET /api/coins). */
async function coinConfig(symbol: string) {
  const upper = symbol.toUpperCase().trim();
  if (!upper) return undefined;
  const base = defaultCoins.find((c) => c.symbol === upper) as Record<string, any> | undefined;
  const row = await Coin.findOne({ symbol: upper }).lean().catch(() => null);
  if (!base && !row) return undefined;
  return { ...(base || {}), ...(row || {}), symbol: upper } as Record<string, any>;
}

const router = Router();

function canAccess(reqUser: Express.Request["user"], userId: unknown) {
  return Boolean(reqUser?.isAdmin || reqUser?.role === "admin" || String(reqUser?._id) === String(userId));
}

async function listTransactions(type: string, req: Parameters<typeof authenticate>[0], res: Parameters<typeof authenticate>[1]) {
  const query: Record<string, unknown> = { type };
  if (!req.user?.isAdmin && req.user?.role !== "admin") query.userId = req.user?._id;
  const rows = await Transaction.find(query).populate("userId", "email name firstName lastName").sort({ createdAt: -1 });
  res.json(rows.map((row) => {
    const item = row.toObject() as Record<string, any>;
    item.user = item.userId;
    item.currency = item.symbol;
    item.walletAddress = item.address;
    item.walletData = { address: item.address, network: item.network };
    return item;
  }));
}

router.use(authenticate);
// Return the promise so Express 5 routes rejections to the error handler. The previous `void` form
// turned any DB/populate error into an unhandled rejection, which crashes the Node process.
router.get("/deposits", (req, res) => listTransactions("deposit", req, res));
router.get("/withdrawals", (req, res) => listTransactions("withdrawal", req, res));
router.get("/trades", (req, res) => listTransactions("trade", req, res));
router.get("/profits", (req, res) => listTransactions("profit", req, res));
router.get("/all", async (req, res) => {
  const userId = req.query.userId || req.user!._id;
  if (!canAccess(req.user, userId)) return res.status(403).json({ message: "Forbidden" });
  const limit = Math.min(200, Number(req.query.limit) || 100);
  res.json(await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(limit));
});

router.post("/deposit", async (req, res) => {
  const userId = req.body.userId || req.user!._id;
  if (!canAccess(req.user, userId)) return res.status(403).json({ message: "Forbidden" });
  const coin = await coinConfig(String(req.body.symbol || ""));
  if (!coin || coin.deposit !== true) return res.status(400).json({ message: "Deposits are not available for this coin" });
  const depositAddress = String(coin.address || "").trim();
  if (!depositAddress) return res.status(400).json({ message: "Deposits for this coin are not available yet" });
  const depositAmount = Number(req.body.amount);
  if (!Number.isFinite(depositAmount) || depositAmount <= 0) return res.status(400).json({ message: "Enter a valid amount" });
  if (Number(coin.minDeposit || 0) > 0 && depositAmount < Number(coin.minDeposit)) return res.status(400).json({ message: `Minimum deposit for ${coin.symbol} is $${coin.minDeposit}` });
  // Network/address always come from the server config, never from the client
  const transaction = await Transaction.create({ ...req.body, userId, symbol: coin.symbol, amount: depositAmount, network: coin.network, address: depositAddress, type: "deposit", status: "pending" });
  res.status(201).json({ deposit: transaction });
});

router.post("/withdraw", async (req, res) => {
  const userId = req.body.userId || req.user!._id;
  if (!canAccess(req.user, userId)) return res.status(403).json({ message: "Forbidden" });
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const amount = Number(req.body.amount);
  const stable = user.assets.find((asset) => ["USDT", "USDC"].includes(asset.symbol));
  const balance = Number(stable?.spot || 0) + Number(stable?.funding || 0);
  if (!Number.isFinite(amount) || amount <= 0 || amount > balance) return res.status(400).json({ message: "Insufficient balance or invalid amount" });
  const wCoin = await coinConfig(String(req.body.symbol || req.body.currency || ""));
  if (!wCoin || wCoin.withdraw !== true) return res.status(400).json({ message: "Withdrawals are not available for this coin" });
  if (Number(wCoin.minWithdraw || 0) > 0 && amount < Number(wCoin.minWithdraw)) return res.status(400).json({ message: `Minimum withdrawal for ${wCoin.symbol} is $${wCoin.minWithdraw}` });
  const transaction = await Transaction.create({ ...req.body, userId, amount, symbol: wCoin.symbol, type: "withdrawal", status: "pending" });
  res.status(201).json({ withdrawal: transaction });
});

router.post("/trade", async (req, res) => {
  const userId = req.body.userId || req.user!._id;
  if (!canAccess(req.user, userId)) return res.status(403).json({ message: "Forbidden" });
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const quantity = Number(req.body.quantity);
  const symbol = String(req.body.symbol || "").toUpperCase().trim();
  const action = String(req.body.action || "").toLowerCase();
  const orderType = String(req.body.orderType || "market").toLowerCase();
  const assetType = String(req.body.assetType || "crypto").toLowerCase() === "stock" ? "stock" : "crypto";
  if (!symbol || symbol === "USDT" || !["buy", "sell"].includes(action) || !["market", "limit"].includes(orderType) || !Number.isFinite(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Invalid trade" });
  }
  const limitPrice = Number(req.body.limitPrice);
  if (orderType === "limit" && (!Number.isFinite(limitPrice) || limitPrice <= 0)) return res.status(400).json({ message: "A valid limit price is required" });

  let marketQuote: Awaited<ReturnType<typeof getMarketPrice>> | undefined;
  try {
    marketQuote = await getMarketPrice(symbol, assetType);
  } catch (error) {
    if (orderType === "market") return res.status(503).json({ message: "A live price is not available for this trade" });
  }
  const executionPrice = orderType === "limit" ? limitPrice : Number(marketQuote?.price);
  if (!Number.isFinite(executionPrice) || executionPrice <= 0) return res.status(503).json({ message: "A live price is not available for this trade" });
  const amount = Number((quantity * executionPrice).toFixed(8));
  const minTradeAmount = await getMinTradeAmount();
  if (amount < minTradeAmount) return res.status(400).json({ message: `Minimum order value is $${minTradeAmount.toFixed(2)}`, minTradeAmount });

  // Only persist whitelisted fields (never spread the raw body into the document).
  const base = {
    userId, symbol, amount, quantity, price: executionPrice, type: "trade" as const, side: action, assetType,
    metadata: { orderType, quoteSource: marketQuote?.source, quotedAt: marketQuote?.time, marketPriceAtPlacement: marketQuote?.price },
  };
  const quoteAsset = user.assets.find((asset) => asset.symbol === "USDT");
  const tradedAsset = user.assets.find((asset) => asset.symbol === symbol);

  if (orderType === "limit") {
    if (action === "buy" && (!quoteAsset || Number(quoteAsset.spot) < amount)) return res.status(400).json({ message: "Insufficient USDT balance" });
    if (action === "sell" && (!tradedAsset || Number(tradedAsset.spot) < quantity)) return res.status(400).json({ message: `Insufficient ${symbol} balance` });
    const trade = await Transaction.create({ ...base, status: "pending" });
    return res.status(201).json({ success: true, trade });
  }

  if (action === "buy") {
    if (!quoteAsset || Number(quoteAsset.spot) < amount) return res.status(400).json({ message: "Insufficient USDT balance" });
    quoteAsset.spot = Number((Number(quoteAsset.spot) - amount).toFixed(8));
    if (tradedAsset) tradedAsset.spot = Number((Number(tradedAsset.spot) + quantity).toFixed(10));
    else user.assets.push({ symbol, name: symbol, spot: quantity, funding: 0 });
  } else {
    if (!tradedAsset || Number(tradedAsset.spot) < quantity) return res.status(400).json({ message: `Insufficient ${symbol} balance` });
    tradedAsset.spot = Number((Number(tradedAsset.spot) - quantity).toFixed(10));
    // Previously proceeds were silently dropped when the user had no USDT entry yet.
    if (quoteAsset) quoteAsset.spot = Number((Number(quoteAsset.spot) + amount).toFixed(8));
    else user.assets.push({ symbol: "USDT", name: "Tether", spot: amount, funding: 0 });
  }
  await user.save();
  const trade = await Transaction.create({ ...base, status: "executed" });
  res.status(201).json({ success: true, trade });
});

router.post("/profit", requireAdmin, async (req, res) => {
  const amount = Number(req.body.amount);
  const user = await User.findById(req.body.userId);
  if (!user || !Number.isFinite(amount)) return res.status(400).json({ message: "Invalid user or amount" });
  const symbol = String(req.body.symbol || "USDT").toUpperCase();
  const asset = user.assets.find((item) => item.symbol === symbol);
  if (asset) asset.spot = Number(asset.spot) + amount;
  else user.assets.push({ symbol, name: symbol, spot: amount, funding: 0 });
  await user.save();
  const transaction = await Transaction.create({ ...req.body, amount, symbol, type: "profit", status: "completed" });
  res.status(201).json({ transaction });
});

router.put("/deposit/approve/:id", requireAdmin, async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, type: "deposit" });
  if (!transaction) return res.status(404).json({ message: "Deposit not found" });
  if (transaction.status !== "approved" && transaction.status !== "completed") {
    const user = await User.findById(transaction.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const symbol = transaction.symbol || "USDT";
    const asset = user.assets.find((item) => item.symbol === symbol);
    if (asset) asset.spot = Number(asset.spot) + transaction.amount;
    else user.assets.push({ symbol, name: symbol, spot: transaction.amount, funding: 0 });
    await user.save();
  }
  transaction.status = "approved";
  transaction.reviewedBy = req.user!._id;
  transaction.reviewedAt = new Date();
  await transaction.save();
  res.json({ deposit: transaction });
});

router.put("/withdrawal/approve/:id", requireAdmin, async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, type: "withdrawal" });
  if (!transaction) return res.status(404).json({ message: "Withdrawal not found" });
  if (transaction.status !== "approved" && transaction.status !== "completed") {
    const user = await User.findById(transaction.userId);
    const asset = user?.assets.find((item) => ["USDT", "USDC"].includes(item.symbol));
    if (!user || !asset || Number(asset.spot) < transaction.amount) return res.status(400).json({ message: "User balance is insufficient" });
    asset.spot = Number(asset.spot) - transaction.amount;
    await user.save();
  }
  transaction.status = "approved";
  transaction.reviewedBy = req.user!._id;
  transaction.reviewedAt = new Date();
  await transaction.save();
  res.json({ withdrawal: transaction });
});

for (const type of ["deposit", "withdrawal"] as const) {
  router.put(`/${type}/reject/:id`, requireAdmin, async (req, res) => {
    const transaction = await Transaction.findOneAndUpdate({ _id: req.params.id, type }, { status: "rejected", description: req.body.reason, reviewedBy: req.user!._id, reviewedAt: new Date() }, { new: true });
    if (!transaction) return res.status(404).json({ message: `${type} not found` });
    res.json({ [type]: transaction });
  });
  router.put(`/${type}/:id`, requireAdmin, async (req, res) => {
    const transaction = await Transaction.findOneAndUpdate({ _id: req.params.id, type }, req.body, { new: true, runValidators: true });
    if (!transaction) return res.status(404).json({ message: `${type} not found` });
    res.json({ [type]: transaction });
  });
}

router.delete("/deposit/:id/cancel", async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, type: "deposit" });
  if (!transaction || !canAccess(req.user, transaction.userId)) return res.status(404).json({ message: "Deposit not found" });
  if (transaction.status !== "pending") return res.status(400).json({ message: "Only pending deposits can be cancelled" });
  transaction.status = "cancelled";
  await transaction.save();
  res.json({ message: "Deposit cancelled" });
});

export default router;
