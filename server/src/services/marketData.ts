import WebSocket from "ws";
import { cryptoCompareApiKey, env } from "../config/env.js";

export type MarketQuote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  open24h: number;
  time: number;
  source: "coindesk-data" | "alpha-vantage";
};

type QuoteListener = (quote: MarketQuote) => void;

const cryptoSymbols = [
  "BTC", "ETH", "SOL", "XRP", "ADA", "DOGE", "BNB", "AVAX", "TRX", "LINK",
  "DOT", "MATIC", "LTC", "BCH", "ATOM", "NEAR", "APT", "ARB", "FIL", "ALGO", "USDT", "USDC",
];

const number = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const cache = new Map<string, MarketQuote>();
const responseCache = new Map<string, { expiresAt: number; value: unknown }>();
const listeners = new Set<QuoteListener>();
const subscriptions = new Set(cryptoSymbols);
let upstream: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | undefined;
let reconnectAttempt = 0;
let stopped = false;

function publish(quote: MarketQuote) {
  cache.set(quote.symbol, quote);
  for (const listener of listeners) listener(quote);
}

async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const existing = responseCache.get(key);
  if (existing && existing.expiresAt > Date.now()) return existing.value as T;
  const value = await loader();
  responseCache.set(key, { expiresAt: Date.now() + ttlMs, value });
  return value;
}

function websocketUrl() {
  const url = new URL("wss://streamer.cryptocompare.com/v2");
  if (cryptoCompareApiKey) url.searchParams.set("api_key", cryptoCompareApiKey);
  return url.toString();
}

function scheduleReconnect() {
  if (stopped || reconnectTimer) return;
  const delay = Math.min(30_000, 1_000 * 2 ** reconnectAttempt++);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = undefined;
    connect();
  }, delay);
}

function connect() {
  if (!cryptoCompareApiKey || stopped || upstream?.readyState === WebSocket.OPEN || upstream?.readyState === WebSocket.CONNECTING) return;
  upstream = new WebSocket(websocketUrl());
  upstream.on("open", () => {
    reconnectAttempt = 0;
    upstream?.send(JSON.stringify({
      action: "SubAdd",
      subs: [...subscriptions].map((symbol) => `5~CCCAGG~${symbol}~USD`),
    }));
  });
  upstream.on("message", (raw) => {
    try {
      const data = JSON.parse(String(raw)) as Record<string, unknown>;
      if (["401", "429", "500"].includes(String(data.TYPE))) {
        console.error("CoinDesk Data stream rejected a request", data.MESSAGE || data);
        return;
      }
      if (String(data.TYPE) !== "5" || !data.FROMSYMBOL) return;
      const symbol = String(data.FROMSYMBOL).toUpperCase();
      const previous = cache.get(symbol);
      const price = number(data.PRICE) || previous?.price || 0;
      if (!price) return;
      publish({
        symbol,
        price,
        change: number(data.CHANGE24HOUR) || previous?.change || 0,
        changePercent: number(data.CHANGEPCT24HOUR) || previous?.changePercent || 0,
        volume: number(data.VOLUME24HOURTO) || previous?.volume || 0,
        high24h: number(data.HIGH24HOUR) || previous?.high24h || 0,
        low24h: number(data.LOW24HOUR) || previous?.low24h || 0,
        open24h: number(data.OPEN24HOUR) || previous?.open24h || 0,
        time: number(data.LASTUPDATE) * 1000 || Date.now(),
        source: "coindesk-data",
      });
    } catch (error) {
      console.error("Unable to parse CoinDesk Data stream message", error);
    }
  });
  upstream.on("error", (error) => console.error("CoinDesk Data stream error", error.message));
  upstream.on("close", () => {
    upstream = null;
    scheduleReconnect();
  });
}

async function cryptoCompareGet(path: string, params: Record<string, string | number>) {
  if (!cryptoCompareApiKey) {
    const error = new Error("CoinDesk Data/CryptoCompare API key is not configured") as Error & { status: number };
    error.status = 503;
    throw error;
  }
  const url = new URL(`https://min-api.cryptocompare.com/data/${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  const response = await fetch(url, {
    headers: { authorization: `Apikey ${cryptoCompareApiKey}` },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`CoinDesk Data request failed with ${response.status}`);
  const payload = await response.json() as any;
  if (payload?.Response === "Error") throw new Error(payload.Message || "CoinDesk Data request failed");
  return payload;
}

export async function getCryptoHistory(symbol: string, endpoint: string, limit: number, currency = "USD") {
  const allowed = new Set(["histominute", "histohour", "histoday"]);
  const selected = allowed.has(endpoint) ? endpoint : "histoday";
  const normalizedLimit = Math.min(2000, Math.max(1, limit));
  const upperSymbol = symbol.toUpperCase();
  const upperCurrency = currency.toUpperCase();
  return cached(`crypto-history:${selected}:${upperSymbol}:${upperCurrency}:${normalizedLimit}`, 5 * 60_000, () =>
    cryptoCompareGet(`v2/${selected}`, {
      fsym: upperSymbol,
      tsym: upperCurrency,
      limit: normalizedLimit,
      e: "CCCAGG",
      extraParams: "BoundingCurve",
    }),
  );
}

export async function getTopCrypto(limit = 50, currency = "USD") {
  const normalizedLimit = Math.min(100, Math.max(1, limit));
  const upperCurrency = currency.toUpperCase();
  return cached(`top-crypto:${normalizedLimit}:${upperCurrency}`, 30_000, () =>
    cryptoCompareGet("top/mktcapfull", { limit: normalizedLimit, tsym: upperCurrency }),
  );
}

export async function getCryptoQuotes(symbols: string[], currency = "USD") {
  const normalized = [...new Set(symbols.map((symbol) => symbol.toUpperCase().replace(/[^A-Z0-9]/g, "")).filter(Boolean))].slice(0, 100);
  const upperCurrency = currency.toUpperCase();
  if (!normalized.length) return {};
  return cached(`crypto-quotes:${normalized.join(",")}:${upperCurrency}`, 30_000, async () => {
    const payload = await cryptoCompareGet("pricemultifull", { fsyms: normalized.join(","), tsyms: upperCurrency });
    return payload?.RAW || {};
  });
}

export async function getStockQuote(symbol: string): Promise<MarketQuote> {
  const upper = symbol.toUpperCase();
  const existing = cache.get(upper);
  if (existing?.source === "alpha-vantage" && Date.now() - existing.time < 60_000) return existing;
  if (!env.ALPHA_VANTAGE_API_KEY) {
    const error = new Error("Alpha Vantage API key is not configured") as Error & { status: number };
    error.status = 503;
    throw error;
  }
  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "GLOBAL_QUOTE");
  url.searchParams.set("symbol", upper);
  url.searchParams.set("apikey", env.ALPHA_VANTAGE_API_KEY);
  const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`Stock quote request failed with ${response.status}`);
  const payload = await response.json() as any;
  const raw = payload?.["Global Quote"];
  if (!raw?.["05. price"]) throw new Error(payload?.Information || payload?.Note || `No quote available for ${symbol}`);
  const quote: MarketQuote = {
    symbol: upper,
    price: number(raw["05. price"]),
    change: number(raw["09. change"]),
    changePercent: number(String(raw["10. change percent"] || "").replace("%", "")),
    volume: number(raw["06. volume"]),
    high24h: number(raw["03. high"]),
    low24h: number(raw["04. low"]),
    open24h: number(raw["02. open"]),
    time: Date.now(),
    source: "alpha-vantage",
  };
  publish(quote);
  return quote;
}

export async function getStockHistory(symbol: string) {
  if (!env.ALPHA_VANTAGE_API_KEY) {
    const error = new Error("Alpha Vantage API key is not configured") as Error & { status: number };
    error.status = 503;
    throw error;
  }
  const upper = symbol.toUpperCase();
  return cached(`stock-history:${upper}`, 60 * 60_000, async () => {
    const url = new URL("https://www.alphavantage.co/query");
    url.searchParams.set("function", "TIME_SERIES_DAILY");
    url.searchParams.set("outputsize", "full");
    url.searchParams.set("symbol", upper);
    url.searchParams.set("apikey", env.ALPHA_VANTAGE_API_KEY!);
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`Stock history request failed with ${response.status}`);
    const payload = await response.json() as any;
    const series = payload?.["Time Series (Daily)"];
    if (!series) throw new Error(payload?.Information || payload?.Note || `No history available for ${symbol}`);
    return Object.entries(series).map(([date, value]: [string, any]) => ({
      time: Math.floor(new Date(date).getTime() / 1000),
      open: number(value["1. open"]),
      high: number(value["2. high"]),
      low: number(value["3. low"]),
      close: number(value["4. close"]),
      volume: number(value["5. volume"]),
    })).sort((a, b) => a.time - b.time);
  });
}

export async function getMarketPrice(symbol: string, assetType = "crypto") {
  const upper = symbol.toUpperCase();
  const cached = cache.get(upper);
  if (cached && Date.now() - cached.time < 60_000) return cached;
  if (assetType === "stock") return getStockQuote(upper);
  const payload = await cryptoCompareGet("pricemultifull", { fsyms: upper, tsyms: "USD" });
  const raw = payload?.RAW?.[upper]?.USD;
  if (!raw?.PRICE) throw new Error(`No live market price available for ${upper}`);
  const quote: MarketQuote = {
    symbol: upper,
    price: number(raw.PRICE),
    change: number(raw.CHANGE24HOUR),
    changePercent: number(raw.CHANGEPCT24HOUR),
    volume: number(raw.VOLUME24HOURTO),
    high24h: number(raw.HIGH24HOUR),
    low24h: number(raw.LOW24HOUR),
    open24h: number(raw.OPEN24HOUR),
    time: number(raw.LASTUPDATE) * 1000 || Date.now(),
    source: "coindesk-data",
  };
  publish(quote);
  return quote;
}

export const marketData = {
  start() { stopped = false; connect(); },
  stop() { stopped = true; if (reconnectTimer) clearTimeout(reconnectTimer); upstream?.close(); },
  onQuote(listener: QuoteListener) { listeners.add(listener); return () => listeners.delete(listener); },
  subscribe(symbols: string[]) {
    const added: string[] = [];
    for (const raw of symbols) {
      const symbol = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!symbol || subscriptions.has(symbol)) continue;
      subscriptions.add(symbol);
      added.push(symbol);
    }
    if (added.length && upstream?.readyState === WebSocket.OPEN) {
      upstream.send(JSON.stringify({ action: "SubAdd", subs: added.map((symbol) => `5~CCCAGG~${symbol}~USD`) }));
    }
  },
  getQuote(symbol: string) { return cache.get(symbol.toUpperCase()); },
  get status() { return upstream?.readyState === WebSocket.OPEN ? "connected" : cryptoCompareApiKey ? "connecting" : "unconfigured"; },
};
