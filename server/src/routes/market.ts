import { Router } from "express";
import { Coin, Stock } from "../models/Market.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { getCryptoHistory, getMarketPrice, getStockHistory, getStockQuote, marketData } from "../services/marketData.js";
import { getLatestBlock, rpcUrls, type RpcNetwork } from "../services/rpc.js";
import { cryptoCompareApiKey, env } from "../config/env.js";
import { defaultCoins, defaultStocks } from "../config/catalogue.js";
import { getMinTradeAmount } from "../services/settings.js";

export const coinsRouter = Router();
export const marketRouter = Router();

const toCoinResponse = (coin: any) => {
  const symbol = String(coin.symbol || "").toUpperCase();
  const live = marketData.getQuote(symbol);
  return {
    ...coin,
    symbol,
    price: live?.price || coin.price || 0,
    change24h: live?.changePercent || coin.changePercent || 0,
    changePercent: live?.changePercent || coin.changePercent || 0,
    high24h: live?.high24h || coin.high24h || 0,
    low24h: live?.low24h || coin.low24h || 0,
    open: live?.open24h || coin.open || 0,
    volume24h: live?.volume || coin.volume24h || 0,
    marketCap: coin.marketCap || 0,
  };
};

// Never 500: upstream or DB failures degrade to the cached/default catalogue.
coinsRouter.get("/", async (_req, res) => {
  await Promise.race([
    marketData.refreshQuotes(),
    new Promise((resolve) => setTimeout(resolve, 4_000)),
  ]).catch((error) => {
    console.warn("Serving cached crypto quotes:", error instanceof Error ? error.message : error);
  });
  let configured: any[] = [];
  try {
    configured = await Coin.find().sort({ symbol: 1 }).lean();
  } catch (error) {
    console.error("Coin catalogue lookup failed; serving defaults", error);
  }
  const catalogue = new Map<string, any>(defaultCoins.map((coin) => [coin.symbol, coin]));
  for (const coin of configured) {
    if (!coin?.symbol) continue;
    const symbol = String(coin.symbol).toUpperCase();
    catalogue.set(symbol, { ...catalogue.get(symbol), ...coin, symbol });
  }
  res.json([...catalogue.values()].map(toCoinResponse));
});coinsRouter.post("/create/:symbol", authenticate, requireAdmin, async (req, res) => {
  const symbol = String(req.params.symbol).toUpperCase();
  const coin = await Coin.findOneAndUpdate({ symbol }, { ...req.body, symbol }, { upsert: true, new: true, runValidators: true });
  res.status(201).json(coin);
});
coinsRouter.put("/update/:symbol", authenticate, requireAdmin, async (req, res) => {
  const coin = await Coin.findOneAndUpdate({ symbol: String(req.params.symbol).toUpperCase() }, req.body, { new: true, runValidators: true });
  if (!coin) return res.status(404).json({ message: "Coin not found" });
  res.json(coin);
});

marketRouter.get("/settings", async (_req, res) => {
  res.json({ minTradeAmount: await getMinTradeAmount() });
});
marketRouter.get("/stocks", async (_req, res) => {
  // Merge DB overrides onto the default catalogue; disabled DB rows hide a default stock. Never 500.
  let configured: any[] = [];
  try {
    configured = await Stock.find().sort({ symbol: 1 }).lean();
  } catch (error) {
    console.error("Stock catalogue lookup failed; serving defaults", error);
  }
  const catalogue = new Map<string, any>(defaultStocks.map((stock) => [stock.symbol, { ...stock }]));
  for (const stock of configured) {
    if (!stock?.symbol) continue;
    const symbol = String(stock.symbol).toUpperCase();
    catalogue.set(symbol, { ...catalogue.get(symbol), ...stock, symbol });
  }
  res.json([...catalogue.values()].filter((stock) => stock.enabled !== false).map((stock) => {
    const live = marketData.getQuote(stock.symbol);
    return live ? { ...stock, price: live.price, change: live.change, changePercent: live.changePercent } : stock;
  }));
});
marketRouter.post("/stock/add", authenticate, requireAdmin, async (req, res) => {
  const symbol = String(req.body.symbol || "").toUpperCase();
  if (!symbol) return res.status(400).json({ message: "Symbol is required" });
  const stock = await Stock.findOneAndUpdate({ symbol }, { ...req.body, symbol, name: req.body.name || symbol }, { upsert: true, new: true, runValidators: true });
  res.status(201).json(stock);
});
marketRouter.put("/stock/:symbol/status", authenticate, requireAdmin, async (req, res) => {
  const stock = await Stock.findOneAndUpdate({ symbol: String(req.params.symbol).toUpperCase() }, { enabled: Boolean(req.body.enabled ?? req.body.status) }, { new: true });
  if (!stock) return res.status(404).json({ message: "Stock not found" });
  res.json(stock);
});
marketRouter.get("/stock/profile", async (req, res) => {
  const symbol = String(req.query.symbol || "").toUpperCase();
  const stock = await Stock.findOne({ symbol }).catch(() => null);
  res.json(stock || defaultStocks.find((item) => item.symbol === symbol) || { symbol, name: symbol, description: "Market instrument" });
});
marketRouter.get("/stock/quote", async (req, res) => {
  const symbol = String(req.query.symbol || "").toUpperCase();
  if (!symbol) return res.status(400).json({ message: "Symbol is required" });
  try {
    const quote = await getStockQuote(symbol);
    res.json({ ...quote, currentPrice: quote.price, open: quote.open24h, high: quote.high24h, low: quote.low24h });
  } catch (error) {
    res.status(503).json({ message: error instanceof Error ? error.message : "Quote unavailable", symbol });
  }
});
marketRouter.get("/stock/historical", async (req, res) => {
  const symbol = String(req.query.symbol || "").toUpperCase();
  if (!symbol) return res.status(400).json({ message: "Symbol is required" });
  const raw = String(req.query.timeframe || "1Y").toUpperCase();
  const timeframe = raw === "1W" ? "5D" : ["1D", "5D", "1M", "1Y"].includes(raw) ? raw : "1Y";
  const days = timeframe === "1D" ? 2 : timeframe === "5D" ? 7 : timeframe === "1M" ? 31 : 366;
  const cutoff = Math.floor(Date.now() / 1000) - days * 86_400;
  const history = await getStockHistory(symbol, timeframe).catch(() => []);
  const data = history.filter((point) => point.time >= cutoff);
  res.json({ symbol, timeframe, data, unavailable: data.length === 0 });
});
marketRouter.get("/crypto/historical", async (req, res) => {
  const symbol = String(req.query.symbol || "").toUpperCase();
  if (!symbol) return res.status(400).json({ message: "Symbol is required" });
  const endpoint = String(req.query.endpoint || "histoday");
  const currency = String(req.query.currency || "USD");
  const limit = Math.min(2000, Math.max(1, Number(req.query.limit) || 120));
  try {
    res.json(await getCryptoHistory(symbol, endpoint, limit, currency));
  } catch (error: any) {
    // Degrade to an empty series instead of a 500 so the chart shows "unavailable" rather than crashing.
    const status = typeof error?.status === "number" && error.status < 500 ? error.status : 200;
    res.status(status).json({ Data: { Data: [] }, unavailable: true, message: error?.message || "History unavailable" });
  }
});
marketRouter.get("/crypto/quote", async (req, res) => {
  const symbol = String(req.query.symbol || "").toUpperCase();
  if (!symbol) return res.status(400).json({ message: "Symbol is required" });
  try {
    res.json(await getMarketPrice(symbol, "crypto"));
  } catch (error) {
    res.status(503).json({ message: error instanceof Error ? error.message : "Quote unavailable", symbol });
  }
});

marketRouter.get("/status", (_req, res) => res.json({
  streaming: marketData.status,
  restBudget: marketData.quota,
  restEnabled: env.MARKET_REST_ENABLED,
  cryptoProvider: "binance-public + coindesk-stream",
  cryptoConfigured: Boolean(cryptoCompareApiKey),
  stockProvider: "alpha-vantage",
  stockConfigured: Boolean(env.ALPHA_VANTAGE_API_KEY),
}));
marketRouter.get("/rpc/:network/status", authenticate, requireAdmin, async (req, res) => {
  const network = req.params.network as RpcNetwork;
  if (!(network in rpcUrls)) return res.status(400).json({ message: "Unsupported RPC network" });
  const latestBlock = await getLatestBlock(network);
  res.json({ network, connected: true, latestBlock });
});
