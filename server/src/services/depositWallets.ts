import { Coin } from "../models/Market.js";
import { DepositWallet } from "../models/DepositWallet.js";
import { defaultCoins } from "../config/catalogue.js";

export type PublicDepositWallet = { _id: string; symbol: string; network: string; address: string; label: string; memo: string; minDeposit: number };

const ADDRESS_RE = /^[A-Za-z0-9:_\-.]{10,200}$/;

/** Validate + normalise admin input. Returns { error } or { value }. */
export function parseDepositWallet(body: Record<string, unknown>, partial = false) {
  const out: Record<string, unknown> = {};
  const str = (k: string, max: number) => {
    if (body[k] === undefined) return;
    out[k] = String(body[k] ?? "").trim().slice(0, max);
  };
  str("symbol", 12); str("network", 40); str("address", 200); str("label", 60); str("memo", 100);
  if (out.symbol !== undefined) out.symbol = String(out.symbol).toUpperCase();
  if (body.minDeposit !== undefined && body.minDeposit !== "") {
    const n = Number(body.minDeposit);
    if (!Number.isFinite(n) || n < 0) return { error: "Minimum deposit must be a number of 0 or more" };
    out.minDeposit = n;
  }
  if (body.enabled !== undefined) out.enabled = body.enabled === true || body.enabled === "true";
  if (!partial || out.symbol !== undefined) if (!/^[A-Z0-9]{2,12}$/.test(String(out.symbol ?? ""))) return { error: "Choose a valid coin symbol" };
  if (!partial || out.network !== undefined) if (!String(out.network ?? "")) return { error: "Network is required (e.g. TRC20, ERC20, Bitcoin)" };
  if (!partial || out.address !== undefined) if (!ADDRESS_RE.test(String(out.address ?? ""))) return { error: "Enter a valid wallet address (10-200 characters, no spaces)" };
  return { value: out };
}

export async function isKnownCoin(symbol: string) {
  return defaultCoins.some((c) => c.symbol === symbol) || Boolean(await Coin.exists({ symbol }).catch(() => null));
}

/** Enabled wallets grouped by symbol (for /api/coins and the user Deposit page). Never throws. */
export async function enabledWalletsBySymbol() {
  const map = new Map<string, PublicDepositWallet[]>();
  try {
    const rows = await DepositWallet.find({ enabled: true }).sort({ symbol: 1, network: 1 }).lean();
    for (const w of rows) {
      const item = { _id: String(w._id), symbol: w.symbol, network: w.network, address: w.address, label: w.label || "", memo: w.memo || "", minDeposit: Number(w.minDeposit || 0) };
      map.set(w.symbol, [...(map.get(w.symbol) || []), item]);
    }
  } catch (error) {
    console.error("Deposit wallet lookup failed", error);
  }
  return map;
}

let migrated = false;
/** One-time: copy any legacy Coin.address values into DepositWallet so nothing is lost. Idempotent. */
export async function migrateLegacyCoinAddresses() {
  if (migrated) return;
  migrated = true;
  try {
    const legacy = await Coin.find({ address: { $nin: ["", null] } }).lean();
    for (const c of legacy) {
      const network = String(c.network || c.symbol);
      await DepositWallet.updateOne(
        { symbol: c.symbol, network },
        { $setOnInsert: { symbol: c.symbol, network, address: c.address, minDeposit: Number(c.minDeposit || 0), enabled: c.deposit !== false, label: "Migrated from coin settings" } },
        { upsert: true },
      );
    }
  } catch (error) {
    migrated = false;
    console.error("Legacy coin address migration failed", error);
  }
}

/* ---- Legacy Wallet -> DepositWallet conversion (only when coin+network are unambiguous) ---- */
// Token CONTRACT addresses are never valid deposit destinations (funds sent there are lost).
const KNOWN_CONTRACTS = new Set([
  "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT (ERC20) contract
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC (ERC20) contract
  "tr7nhqjekqxgtci8q8zy4pl8otszgjlj6t", // USDT (TRC20) contract
]);

export type LegacyInference = { ok: true; symbol: string; network: string } | { ok: false; reason: string };

export function inferLegacyWallet(rec: { address?: string; network?: string; provider?: string }): LegacyInference {
  const address = String(rec.address || "").trim();
  const net = `${rec.network || ""} ${rec.provider || ""}`.toLowerCase();
  if (!ADDRESS_RE.test(address)) return { ok: false, reason: "address is not valid" };
  if (KNOWN_CONTRACTS.has(address.toLowerCase())) return { ok: false, reason: "address is a token CONTRACT, not a wallet: funds sent there would be lost" };
  if (/usdt|usdc|tether|stable|trc20|bep20/.test(net)) return { ok: false, reason: "stablecoin network is ambiguous (ERC20/TRC20/BEP20): re-add with an explicit network" };
  if (/\b(btc|bitcoin)\b/.test(net) && /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{20,}$/.test(address)) return { ok: true, symbol: "BTC", network: "Bitcoin" };
  if (/\b(eth|ethereum|erc20)\b/.test(net) && /^0x[0-9a-fA-F]{40}$/.test(address)) return { ok: true, symbol: "ETH", network: "Ethereum" };
  return { ok: false, reason: "could not infer coin/network unambiguously" };
}
