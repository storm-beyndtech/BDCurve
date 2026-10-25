import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const directory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(directory, "../../.env") });
dotenv.config({ path: path.resolve(directory, "../../../.env") });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(32).default("development-only-change-this-secret"),
  CLIENT_ORIGINS: z.string().default("http://localhost:5173"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.string().transform((value) => value === "true").default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default("Bounding Curve <support@boundingcurve.com>"),
  // Preferred provider: Resend over HTTPS (no SMTP ports needed). Falls back to SMTP if unset.
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  ADMIN_NOTIFY_EMAILS: z.string().optional(),
  APP_URL: z.string().default("https://www.boundingcurve.com"),
  MARKET_DATA_API_KEY: z.string().optional(),
  CRYPTOCOMPARE_API_KEY: z.string().optional(),
  COINDESK_DATA_API_KEY: z.string().optional(),
  MARKET_STREAM_ENABLED: z.string().transform((value) => value === "true").default(true),
  MARKET_REST_ENABLED: z.string().transform((value) => value === "true").default(true),
  MARKET_STREAM_SYMBOLS: z.string().default("BTC,ETH,SOL,XRP,ADA,DOGE,BNB,AVAX,TRX,LINK,DOT,MATIC,LTC,BCH,ATOM,NEAR,APT,ARB,FIL,ALGO,USDT,USDC"),
  MARKET_STREAM_MAX_SYMBOLS: z.coerce.number().int().min(1).max(600).default(100),
  MARKET_REST_REQUESTS_PER_HOUR: z.coerce.number().int().min(1).max(1200).default(120),
  MARKET_RATE_LIMIT_RESERVE: z.coerce.number().int().min(0).default(100),
  MARKET_QUOTE_CACHE_SECONDS: z.coerce.number().int().min(30).default(300),
  MARKET_HISTORY_CACHE_SECONDS: z.coerce.number().int().min(300).default(2592000),
  ALPHA_VANTAGE_API_KEY: z.string().optional(),
  ETHEREUM_RPC_URL: z.string().url().default("https://ethereum-rpc.publicnode.com"),
  BSC_RPC_URL: z.string().url().default("https://bsc-rpc.publicnode.com"),
  POLYGON_RPC_URL: z.string().url().default("https://polygon-bor-rpc.publicnode.com"),
  ARBITRUM_RPC_URL: z.string().url().default("https://arbitrum-one-rpc.publicnode.com"),
  BASE_RPC_URL: z.string().url().default("https://base-rpc.publicnode.com"),
  SOLANA_RPC_URL: z.string().url().default("https://api.mainnet-beta.solana.com"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default("bounding-curve"),
});

export const env = schema.parse(process.env);
export const allowedOrigins = env.CLIENT_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
export const cryptoCompareApiKey = env.CRYPTOCOMPARE_API_KEY || env.COINDESK_DATA_API_KEY || env.MARKET_DATA_API_KEY;
export const marketStreamSymbols = [...new Set(env.MARKET_STREAM_SYMBOLS.split(",").map((symbol) => symbol.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")).filter(Boolean))]
  .slice(0, env.MARKET_STREAM_MAX_SYMBOLS);
