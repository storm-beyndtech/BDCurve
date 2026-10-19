import dotenv from "dotenv";
import WebSocket from "ws";

dotenv.config({ quiet: true });

if (process.env.ALLOW_MARKET_LIVE_TEST !== "true") {
  console.log("Live market verification skipped. Set ALLOW_MARKET_LIVE_TEST=true for a deliberate billable test.");
  process.exit(0);
}

const apiKey = process.env.CRYPTOCOMPARE_API_KEY
  || process.env.COINDESK_DATA_API_KEY
  || process.env.MARKET_DATA_API_KEY;

if (!apiKey) throw new Error("A CoinDesk Data/CryptoCompare API key is required");

const restResponse = await fetch(
  "https://min-api.cryptocompare.com/data/v2/histohour?fsym=BTC&tsym=USD&limit=2&e=CCCAGG&extraParams=BoundingCurve",
  { headers: { authorization: `Apikey ${apiKey}` }, signal: AbortSignal.timeout(15_000) },
);
const restPayload = await restResponse.json();
if (!restResponse.ok || restPayload.Response !== "Success" || !restPayload.Data?.Data?.length) {
  throw new Error(`CoinDesk Data REST validation failed: ${restPayload.Message || restResponse.status}`);
}

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${encodeURIComponent(apiKey)}`,
);

const timer = setTimeout(() => {
  console.error("CoinDesk Data WebSocket validation timed out");
  socket.terminate();
  process.exitCode = 1;
}, 15_000);

socket.on("open", () => {
  socket.send(JSON.stringify({ action: "SubAdd", subs: ["5~CCCAGG~BTC~USD"] }));
});

socket.on("message", (raw) => {
  const data = JSON.parse(String(raw));
  if (["401", "429", "500"].includes(String(data.TYPE))) {
    clearTimeout(timer);
    console.error(`CoinDesk Data WebSocket rejected the request: ${data.MESSAGE || data.TYPE}`);
    socket.close();
    process.exitCode = 1;
    return;
  }
  if (String(data.TYPE) === "5" && data.FROMSYMBOL === "BTC" && data.PRICE) {
    clearTimeout(timer);
    console.log("CoinDesk Data REST and WebSocket credentials are valid; a live BTC-USD quote was received.");
    socket.close();
  }
});

socket.on("error", (error) => {
  clearTimeout(timer);
  console.error(`CoinDesk Data WebSocket error: ${error.message}`);
  process.exitCode = 1;
});
