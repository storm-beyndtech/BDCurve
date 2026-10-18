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

  sockets.on("connection", (socket) => {
    socket.on("message", (message) => {
      try {
        const payload = JSON.parse(String(message));
        if (payload.type === "ping") socket.send(JSON.stringify({ type: "pong", time: Date.now() }));
        if (payload.type === "subscribe" && Array.isArray(payload.symbols)) marketData.subscribe(payload.symbols.slice(0, 100));
      } catch {
        socket.send(JSON.stringify({ type: "error", message: "Invalid WebSocket message" }));
      }
    });
  });

  marketData.onQuote((quote) => {
    const message = JSON.stringify({ type: "quote", ...quote });
    for (const client of sockets.clients) {
      if (client.readyState === client.OPEN) client.send(message);
    }
  });
  marketData.start();

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

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exitCode = 1;
});
