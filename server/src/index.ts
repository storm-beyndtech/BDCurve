import http from "node:http";
import mongoose from "mongoose";
import { WebSocketServer } from "ws";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { marketData } from "./services/marketData.js";

async function start() {
  await mongoose.connect(env.MONGODB_URI);
  const server = http.createServer(app);
  const sockets = new WebSocketServer({ server });
  const clientSubscriptions = new Map<import("ws").WebSocket, Set<string>>();

  sockets.on("connection", (socket) => {
    const subscribed = new Set<string>();
    clientSubscriptions.set(socket, subscribed);

    socket.on("message", (message) => {
      try {
        const payload = JSON.parse(String(message));
        if (payload.type === "ping") socket.send(JSON.stringify({ type: "pong", time: Date.now() }));
        if (payload.type === "subscribe" && Array.isArray(payload.symbols)) {
          const requested = payload.symbols
            .map((value: unknown) => String(value).toUpperCase().replace(/[^A-Z0-9]/g, ""))
            .filter((symbol: string) => symbol && marketData.isTracked(symbol) && !subscribed.has(symbol))
            .slice(0, 100);
          requested.forEach((symbol: string) => {
            subscribed.add(symbol);
            const quote = marketData.getQuote(symbol);
            if (quote && socket.readyState === socket.OPEN) socket.send(JSON.stringify({ type: "quote", ...quote }));
          });
          marketData.retainSymbols(requested);
        }
        if (payload.type === "unsubscribe" && Array.isArray(payload.symbols)) {
          const removed = payload.symbols
            .map((value: unknown) => String(value).toUpperCase().replace(/[^A-Z0-9]/g, ""))
            .filter((symbol: string) => subscribed.delete(symbol));
          marketData.releaseSymbols(removed);
        }
      } catch {
        socket.send(JSON.stringify({ type: "error", message: "Invalid WebSocket message" }));
      }
    });

    socket.on("close", () => {
      marketData.releaseSymbols([...subscribed]);
      clientSubscriptions.delete(socket);
    });
  });

  marketData.onQuote((quote) => {
    const message = JSON.stringify({ type: "quote", ...quote });
    for (const client of sockets.clients) {
      if (client.readyState === client.OPEN && clientSubscriptions.get(client)?.has(quote.symbol)) client.send(message);
    }
  });
  await marketData.start();

  server.listen(env.PORT, () => {
    console.info(`Bounding Curve server listening on port ${env.PORT}`);
  });

  const shutdown = () => {
    marketData.stop();
    sockets.close();
    server.close(() => void mongoose.disconnect());
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

// Log instead of crashing the whole API on a stray rejected promise / socket error.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception", error);
});

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exitCode = 1;
});
