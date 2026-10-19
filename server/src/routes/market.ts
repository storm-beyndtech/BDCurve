import { Router } from "express";
import { Coin, Stock } from "../models/Market.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { getCryptoHistory, getMarketPrice, getStockHistory, getStockQuote, marketData } from "../services/marketData.js";
import { getLatestBlock, rpcUrls, type RpcNetwork } from "../services/rpc.js";
import { cryptoCompareApiKey, env } from "../config/env.js";

export const coinsRouter = Router();
export const marketRouter = Router();

const defaultCoins = [
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin", deposit: true, withdraw: true, minDeposit: 10, minWithdraw: 20, withdrawalFee: 0.5 },
  { symbol: "ETH", name: "Ethereum", network: "Ethereum", deposit: true, withdraw: true, minDeposit: 10, minWithdraw: 20, withdrawalFee: 0.5 },
  { symbol: "USDT", name: "Tether", network: "TRC20", deposit: true, withdraw: true, minDeposit: 10, minWithdraw: 10, withdrawalFee: 1 },
  { symbol: "SOL", name: "Solana", network: "Solana", deposit: false, withdraw: false },
  { symbol: "XRP", name: "XRP", network: "XRP Ledger", deposit: false, withdraw: false },
  { symbol: "ADA", name: "Cardano", network: "Cardano", deposit: false, withdraw: false },
  { symbol: "DOGE", name: "Dogecoin", network: "Dogecoin", deposit: false, withdraw: false },
  { symbol: "BNB", name: "BNB", network: "BNB Smart Chain", deposit: false, withdraw: false },
  { symbol: "AVAX", name: "Avalanche", network: "Avalanche", deposit: false, withdraw: false },
  { symbol: "TRX", name: "TRON", network: "TRON", deposit: false, withdraw: false },
  { symbol: "LINK", name: "Chainlink", network: "Ethereum", deposit: false, withdraw: false },
  { symbol: "DOT", name: "Polkadot", network: "Polkadot", deposit: false, withdraw: false },
  { symbol: "LTC", name: "Litecoin", network: "Litecoin", deposit: false, withdraw: false },
  { symbol: "BCH", name: "Bitcoin Cash", network: "Bitcoin Cash", deposit: false, withdraw: false },
  { symbol: "ATOM", name: "Cosmos", network: "Cosmos", deposit: false, withdraw: false },
  { symbol: "NEAR", name: "NEAR Protocol", network: "NEAR", deposit: false, withdraw: false },
  { symbol: "APT", name: "Aptos", network: "Aptos", deposit: false, withdraw: false },
  { symbol: "ARB", name: "Arbitrum", network: "Arbitrum", deposit: false, withdraw: false },
  { symbol: "FIL", name: "Filecoin", network: "Filecoin", deposit: false, withdraw: false },
  { symbol: "ALGO", name: "Algorand", network: "Algorand", deposit: false, withdraw: false },
  { symbol: "USDC", name: "USD Coin", network: "Ethereum", deposit: false, withdraw: false },
];

const defaultStocks = [
  { symbol: "AAPL", name: "Apple Inc.", enabled: true, price: 225 },
  { symbol: "MSFT", name: "Microsoft Corporation", enabled: true, price: 420 },
  { symbol: "NVDA", name: "NVIDIA Corporation", enabled: true, price: 140 },
  { symbol: "TSLA", name: "Tesla, Inc.", enabled: true, price: 260 },
];

coinsRouter.get("/", async (_req, res) => {
  await marketData.refreshQuotes().catch((error) => {
    console.warn("Serving cached crypto quotes:", error instanceof Error ? error.message : error);
  });
  const configured = await Coin.find().sort({ symbol: 1 }).lean();
  const catalogue = new Map(defaultCoins.map((coin) => [coin.symbol, coin]));
  for (const coin of configured) catalogue.set(coin.symbol, { ...catalogue.get(coin.symbol), ...coin } as any);
  const coins = [...catalogue.values()];
  return res.json(coins.map((coin: any) => {
    const symbol = String(coin.symbol).toUpperCase();
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
  }));
});
coinsRouter.post("/create/:symbol", authenticate, requireAdmin, async (req, res) => {
  const symbol = String(req.params.symbol).toUpperCase();
  const coin = await Coin.findOneAndUpdate({ symbol }, { ...req.body, symbol }, { upsert: true, new: true, runValidators: true });
  res.status(201).json(coin);
});
coinsRouter.put("/update/:symbol", authenticate, requireAdmin, async (req, res) => {
  const coin = await Coin.findOneAndUpdate({ symbol: String(req.params.symbol).toUpperCase() }, req.body, { new: true, runValidators: true });
  if (!coin) return res.status(404).json({ message: "Coin not found" });
  res.json(coin);
});

marketRouter.get("/stocks", async (_req, res) => {
  const stocks = await Stock.find({ enabled: true }).sort({ symbol: 1 });
  res.json(stocks.length ? stocks : defaultStocks);
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
  const stock = await Stock.findOne({ symbol });
  res.json(stock || defaultStocks.find((item) => item.symbol === symbol) || { symbol, name: symbol, description: "Market instrument" });
});
marketRouter.get("/stock/quote", async (req, res) => {
  const symbol = String(req.query.symbol || "").toUpperCase();
  if (!symbol) return res.status(400).json({ message: "Symbol is required" });
  const quote = await getStockQuote(symbol);
  res.json({ ...quote, currentPrice: quote.price, open: quote.open24h, high: quote.high24h, low: quote.low24h });
});
marketRouter.get("/stock/historical", async (req, res) => {
  const symbol = String(req.query.symbol || "").toUpperCase();
  if (!symbol) return res.status(400).json({ message: "Symbol is required" });
  const timeframe = String(req.query.timeframe || "1Y").toUpperCase();
  const days = timeframe === "1D" ? 2 : timeframe === "5D" || timeframe === "1W" ? 7 : timeframe === "1M" ? 31 : 366;
  const cutoff = Math.floor(Date.now() / 1000) - days * 86_400;
  const data = (await getStockHistory(symbol)).filter((point) => point.time >= cutoff);
  res.json({ symbol, timeframe, data, source: "alpha-vantage" });
});
marketRouter.get("/crypto/historical", async (req, res) => {
  const symbol = String(req.query.symbol || "").toUpperCase();
  if (!symbol) return res.status(400).json({ message: "Symbol is required" });
  const endpoint = String(req.query.endpoint || "histoday");
  const currency = String(req.query.currency || "USD");
  const limit = Math.min(2000, Math.max(1, Number(req.query.limit) || 120));
  res.json(await getCryptoHistory(symbol, endpoint, limit, currency));
});
marketRouter.get("/crypto/quote", async (req, res) => {
  const symbol = String(req.query.symbol || "").toUpperCase();
  if (!symbol) return res.status(400).json({ message: "Symbol is required" });
  res.json(await getMarketPrice(symbol, "crypto"));
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
