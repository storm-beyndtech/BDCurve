import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { allowedOrigins } from "./config/env.js";
import authRouter from "./routes/auth.js";
import transactionsRouter from "./routes/transactions.js";
import { coinsRouter, marketRouter } from "./routes/market.js";
import tradersRouter from "./routes/traders.js";
import liveTradesRouter from "./routes/liveTrades.js";
import { adminRouter, contactRouter, walletRouter, withdrawalsRouter } from "./routes/operations.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { marketData } from "./services/marketData.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));
app.use(morgan("combined"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 180, standardHeaders: "draft-8", legacyHeaders: false }));

app.get("/api/health", (_req, res) => res.json({
  status: "ok",
  service: "bounding-curve-server",
  marketData: marketData.status,
  timestamp: new Date().toISOString(),
}));
app.use("/api/auth", authRouter);
app.use("/api/transaction", transactionsRouter);
app.use("/api/coins", coinsRouter);
app.use("/api/market", marketRouter);
app.use("/api/trader", tradersRouter);
app.use("/api/live-trade", liveTradesRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/admin", adminRouter);
app.use("/api/contact", contactRouter);
app.use("/api/withdrawals", withdrawalsRouter);

app.use(notFound);
app.use(errorHandler);
