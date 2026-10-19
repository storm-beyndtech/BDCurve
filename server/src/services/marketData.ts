import WebSocket from "ws";
import { cryptoCompareApiKey, env, marketStreamSymbols } from "../config/env.js";
import { MarketHistoryCache, MarketSnapshot } from "../models/MarketCache.js";

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
type ServiceError = Error & { status?: number };
type RateLimitState = {
  limit?: number;
  remaining?: number;
  resetAt?: number;
  updatedAt?: number;
  source: "rest-headers" | "stream-welcome" | "local";
};

const HOUR_MS = 60 * 60_000;
const SNAPSHOT_WRITE_INTERVAL_MS = 60_000;
const MAX_RESPONSE_CACHE_ENTRIES = 256;
const number = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const normalizeSymbol = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");
const firstInteger = (value: string | null) => {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : undefined;
};

const quoteCache = new Map<string, MarketQuote>();
const responseCache = new Map<string, { expiresAt: number; value: unknown }>();
const inFlight = new Map<string, Promise<unknown>>();
const listeners = new Set<QuoteListener>();
const trackedSymbols = new Set(marketStreamSymbols);
const lastSnapshotWrites = new Map<string, number>();

let upstream: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | undefined;
let watchdogTimer: NodeJS.Timeout | undefined;
let reconnectAttempt = 0;
let stopped = true;
let streamAuthFailed = false;
let streamBackoffUntil = 0;
let lastStreamMessageAt = 0;
let budgetWindowStartedAt = Date.now();
let budgetUsed = 0;
let restRateLimit: RateLimitState = { source: "local" };
let streamRateLimit: RateLimitState = { source: "stream-welcome" };

function persistSnapshot(quote: MarketQuote) {
  const lastWrite = lastSnapshotWrites.get(quote.symbol) || 0;
  if (Date.now() - lastWrite < SNAPSHOT_WRITE_INTERVAL_MS) return;
  lastSnapshotWrites.set(quote.symbol, Date.now());
  void MarketSnapshot.findOneAndUpdate(
    { symbol: quote.symbol },
    { symbol: quote.symbol, quote },
    { upsert: true, new: true },
  ).catch((error) => console.error(`Unable to persist ${quote.symbol} market snapshot`, error));
}

function publish(quote: MarketQuote, persist = true) {
  quoteCache.set(quote.symbol, quote);
  if (persist) persistSnapshot(quote);
  for (const listener of listeners) listener(quote);
}

async function loadSnapshots() {
  const snapshots = await MarketSnapshot.find({}).lean();
  for (const snapshot of snapshots) {
    const quote = snapshot.quote as MarketQuote;
    if (quote?.symbol && quote.price > 0) publish(quote, false);
  }
}

async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const now = Date.now();
  for (const [cachedKey, entry] of responseCache) {
    if (entry.expiresAt <= now) responseCache.delete(cachedKey);
  }
  const existing = responseCache.get(key);
  if (existing && existing.expiresAt > now) return existing.value as T;
  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const request = loader()
    .then((value) => {
      while (responseCache.size >= MAX_RESPONSE_CACHE_ENTRIES) {
        const oldestKey = responseCache.keys().next().value as string | undefined;
        if (!oldestKey) break;
        responseCache.delete(oldestKey);
      }
      responseCache.set(key, { expiresAt: Date.now() + ttlMs, value });
      return value;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}

async function persistentCached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  return cached(key, ttlMs, async () => {
    const stored = await MarketHistoryCache.findOne({ key, expiresAt: { $gt: new Date() } }).lean();
    if (stored) return stored.payload as T;
    const value = await loader();
    await MarketHistoryCache.findOneAndUpdate(
      { key },
      { key, payload: value, expiresAt: new Date(Date.now() + ttlMs) },
      { upsert: true, new: true },
    );
    return value;
  });
}

function consumeLocalRestBudget() {
  const now = Date.now();
  if (now - budgetWindowStartedAt >= HOUR_MS) {
    budgetWindowStartedAt = now;
    budgetUsed = 0;
  }
  if (restRateLimit.remaining !== undefined && restRateLimit.remaining <= env.MARKET_RATE_LIMIT_RESERVE) {
    const error = new Error("Market-data reserve reached; cached data remains available until the provider resets") as ServiceError;
    error.status = 429;
    throw error;
  }
  if (budgetUsed >= env.MARKET_REST_REQUESTS_PER_HOUR) {
    const error = new Error("Local market-data safety limit reached; cached data remains available") as ServiceError;
    error.status = 429;
    throw error;
  }
  budgetUsed += 1;
}

function updateRestRateLimit(headers: Headers) {
  const remaining = firstInteger(headers.get("x-ratelimit-remaining"));
  const limit = firstInteger(headers.get("x-ratelimit-limit"));
  const resetSeconds = firstInteger(headers.get("x-ratelimit-reset"));
  if (remaining === undefined && limit === undefined) return;
  restRateLimit = {
    remaining,
    limit,
    resetAt: resetSeconds === undefined ? undefined : Date.now() + resetSeconds * 1000,
    updatedAt: Date.now(),
    source: "rest-headers",
  };
}

function updateStreamRateLimit(data: Record<string, unknown>) {
  const remaining = number(data.RATELIMIT_REMAINING_MONTH);
  const limit = number(data.RATELIMIT_MAX_MONTH);
  streamRateLimit = {
    remaining: remaining || undefined,
    limit: limit || undefined,
    updatedAt: Date.now(),
    source: "stream-welcome",
  };
}

function scheduleReconnect() {
  if (stopped || streamAuthFailed || reconnectTimer || !env.MARKET_STREAM_ENABLED) return;
  const exponentialDelay = Math.min(60_000, 5_000 * 2 ** reconnectAttempt++);
  const delay = Math.max(exponentialDelay, streamBackoffUntil - Date.now(), 5_000);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = undefined;
    connect();
  }, delay + Math.floor(Math.random() * 1_000));
}

function setupWatchdog() {
  if (watchdogTimer) clearInterval(watchdogTimer);
  watchdogTimer = setInterval(() => {
    if (upstream?.readyState === WebSocket.OPEN && Date.now() - lastStreamMessageAt > 130_000) {
      console.warn("CoinDesk Data stream heartbeat is stale; reconnecting once");
      upstream.terminate();
    }
  }, 60_000);
}

function connect() {
  if (!env.MARKET_STREAM_ENABLED || !cryptoCompareApiKey || stopped || streamAuthFailed || trackedSymbols.size === 0) return;
  if (upstream?.readyState === WebSocket.OPEN || upstream?.readyState === WebSocket.CONNECTING) return;

  upstream = new WebSocket("wss://streamer.cryptocompare.com/v2", {
    headers: { authorization: `Apikey ${cryptoCompareApiKey}` },
  });
  upstream.on("open", () => {
    reconnectAttempt = 0;
    lastStreamMessageAt = Date.now();
    upstream?.send(JSON.stringify({
      action: "SubAdd",
      subs: [...trackedSymbols].map((symbol) => `5~CCCAGG~${symbol}~USD`),
    }));
    setupWatchdog();
  });
  upstream.on("message", (raw) => {
    lastStreamMessageAt = Date.now();
    try {
      const data = JSON.parse(String(raw)) as Record<string, unknown>;
      const type = String(data.TYPE);
      if (type === "20") {
        updateStreamRateLimit(data);
        return;
      }
      if (type === "401") {
        streamAuthFailed = true;
        console.error("CoinDesk Data stream authorization failed; automatic reconnect is paused");
        upstream?.close();
        return;
      }
      if (type === "429") {
        streamBackoffUntil = Date.now() + 60_000;
        console.warn("CoinDesk Data socket rate limit reached; retrying after cooldown");
        upstream?.close();
        return;
      }
      if (type === "500") {
        console.error("CoinDesk Data stream rejected a subscription");
        return;
      }
      if (type !== "5" || !data.FROMSYMBOL) return;

      const symbol = normalizeSymbol(String(data.FROMSYMBOL));
      if (!trackedSymbols.has(symbol)) return;
      const previous = quoteCache.get(symbol);
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
    if (watchdogTimer) clearInterval(watchdogTimer);
    watchdogTimer = undefined;
    scheduleReconnect();
  });
}

async function cryptoCompareGet(path: string, params: Record<string, string | number>) {
  if (!env.MARKET_REST_ENABLED) {
    const error = new Error("CoinDesk Data REST access is disabled") as ServiceError;
    error.status = 503;
    throw error;
  }
  if (!cryptoCompareApiKey) {
    const error = new Error("CoinDesk Data/CryptoCompare API key is not configured") as ServiceError;
    error.status = 503;
    throw error;
  }

  consumeLocalRestBudget();
  const url = new URL(`https://min-api.cryptocompare.com/data/${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  const response = await fetch(url, {
    headers: { authorization: `Apikey ${cryptoCompareApiKey}` },
    signal: AbortSignal.timeout(12_000),
  });
  updateRestRateLimit(response.headers);
  if (!response.ok) {
    const error = new Error(`CoinDesk Data request failed with ${response.status}`) as ServiceError;
    error.status = response.status;
    throw error;
  }
  const payload = await response.json() as any;
  if (payload?.Response === "Error") throw new Error(payload.Message || "CoinDesk Data request failed");
  return payload;
}

export async function getCryptoHistory(symbol: string, endpoint: string, limit: number, currency = "USD") {
  const allowed = new Set(["histominute", "histohour", "histoday"]);
  const selected = allowed.has(endpoint) ? endpoint : "histoday";
  const upperSymbol = normalizeSymbol(symbol);
  const upperCurrency = normalizeSymbol(currency);
  if (!trackedSymbols.has(upperSymbol)) {
    const error = new Error("Historical data is only available for configured market symbols") as ServiceError;
    error.status = 400;
    throw error;
  }
  if (upperCurrency !== "USD") {
    const error = new Error("USD is the only supported historical quote currency") as ServiceError;
    error.status = 400;
    throw error;
  }
  const canonicalLimit = selected === "histominute" ? 1440 : selected === "histohour" ? 168 : 365;
  const normalizedLimit = Math.min(canonicalLimit, Math.max(1, limit));
  const key = `crypto-history:${selected}:${upperSymbol}:USD`;
  const ttlMs = selected === "histominute" ? 15 * 60_000 : selected === "histohour" ? 60 * 60_000 : env.MARKET_HISTORY_CACHE_SECONDS * 1000;
  const payload = await persistentCached<any>(key, ttlMs, () => cryptoCompareGet(`v2/${selected}`, {
    fsym: upperSymbol,
    tsym: upperCurrency,
    limit: canonicalLimit,
    e: "CCCAGG",
    extraParams: "BoundingCurve",
  }));
  const rows = payload?.Data?.Data;
  if (!Array.isArray(rows)) return payload;
  return { ...payload, Data: { ...payload.Data, Data: rows.slice(-(normalizedLimit + 1)) } };
}

export async function getTopCrypto(limit = 50, currency = "USD") {
  const normalizedLimit = Math.min(100, Math.max(1, limit));
  const upperCurrency = normalizeSymbol(currency);
  return cached(`top-crypto:${normalizedLimit}:${upperCurrency}`, env.MARKET_QUOTE_CACHE_SECONDS * 1000, () =>
    cryptoCompareGet("top/mktcapfull", { limit: normalizedLimit, tsym: upperCurrency }),
  );
}

export async function getCryptoQuotes(symbols: string[], currency = "USD") {
  const normalized = [...new Set(symbols.map(normalizeSymbol).filter(Boolean))].sort().slice(0, 100);
  const upperCurrency = normalizeSymbol(currency);
  if (!normalized.length) return {};
  return cached(`crypto-quotes:${normalized.join(",")}:${upperCurrency}`, env.MARKET_QUOTE_CACHE_SECONDS * 1000, async () => {
    const payload = await cryptoCompareGet("pricemultifull", { fsyms: normalized.join(","), tsyms: upperCurrency });
    return payload?.RAW || {};
  });
}

export async function getStockQuote(symbol: string): Promise<MarketQuote> {
  const upper = normalizeSymbol(symbol);
  const existing = quoteCache.get(upper);
  if (existing?.source === "alpha-vantage" && Date.now() - existing.time < 60_000) return existing;
  if (!env.ALPHA_VANTAGE_API_KEY) {
    const error = new Error("Alpha Vantage API key is not configured") as ServiceError;
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
    const error = new Error("Alpha Vantage API key is not configured") as ServiceError;
    error.status = 503;
    throw error;
  }
  const upper = normalizeSymbol(symbol);
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
  const upper = normalizeSymbol(symbol);
  const existing = quoteCache.get(upper);
  if (existing && Date.now() - existing.time < env.MARKET_QUOTE_CACHE_SECONDS * 1000) return existing;
  if (assetType === "stock") return getStockQuote(upper);
  const payload = await getCryptoQuotes([upper]);
  const raw = (payload as any)?.[upper]?.USD;
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
  async start() {
    stopped = false;
    await loadSnapshots();
    connect();
  },
  stop() {
    stopped = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (watchdogTimer) clearInterval(watchdogTimer);
    reconnectTimer = undefined;
    watchdogTimer = undefined;
    upstream?.close();
    upstream = null;
  },
  onQuote(listener: QuoteListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  isTracked(symbol: string) {
    return trackedSymbols.has(normalizeSymbol(symbol));
  },
  getQuote(symbol: string) {
    return quoteCache.get(normalizeSymbol(symbol));
  },
  get status() {
    if (!cryptoCompareApiKey) return "unconfigured";
    if (!env.MARKET_STREAM_ENABLED) return "disabled";
    if (streamAuthFailed) return "auth-paused";
    if (upstream?.readyState === WebSocket.OPEN) return "connected";
    return "connecting";
  },
  get quota() {
    return {
      rest: restRateLimit,
      stream: streamRateLimit,
      local: {
        used: budgetUsed,
        limit: env.MARKET_REST_REQUESTS_PER_HOUR,
        remaining: Math.max(0, env.MARKET_REST_REQUESTS_PER_HOUR - budgetUsed),
        resetAt: budgetWindowStartedAt + HOUR_MS,
      },
      reserve: env.MARKET_RATE_LIMIT_RESERVE,
    };
  },
};
