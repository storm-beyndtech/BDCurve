/**
 * Convert legacy admin "Wallet" records into platform DepositWallets when coin+network are unambiguous.
 * Dry run by default; pass --apply to write. Idempotent (upsert on symbol+network, never overwrites).
 * Prints masked addresses only.
 */
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { Wallet } from "../models/Operations.js";
import { DepositWallet } from "../models/DepositWallet.js";
import { inferLegacyWallet } from "../services/depositWallets.js";

const apply = process.argv.includes("--apply");
const mask = (a: string) => (a.length > 10 ? `${a.slice(0, 4)}...${a.slice(-4)}` : "****");

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  const legacy = await Wallet.find({ userId: { $exists: false } }).lean();
  for (const w of legacy) {
    const inf = inferLegacyWallet(w as any);
    if (!inf.ok) { console.log(`SKIP ${mask(String(w.address))} [${w.network}]: ${inf.reason}`); continue; }
    if (!apply) { console.log(`WOULD CONVERT ${mask(String(w.address))} -> ${inf.symbol}/${inf.network}`); continue; }
    const res = await DepositWallet.updateOne(
      { symbol: inf.symbol, network: inf.network },
      { $setOnInsert: { symbol: inf.symbol, network: inf.network, address: String(w.address).trim(), label: "Converted from legacy wallet", minDeposit: 10, enabled: true } },
      { upsert: true },
    );
    console.log(`${res.upsertedCount ? "CONVERTED" : "EXISTS"} ${mask(String(w.address))} -> ${inf.symbol}/${inf.network}`);
  }
  console.log(`deposit wallets now: ${await DepositWallet.countDocuments()}`);
  await mongoose.disconnect();
}
main().catch(async (e) => { console.error(e instanceof Error ? e.message : e); await mongoose.disconnect(); process.exit(1); });
