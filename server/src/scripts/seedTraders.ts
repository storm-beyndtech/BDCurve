import mongoose from "mongoose";
import { env } from "../config/env.js";
import { Trader } from "../models/Trading.js";

const avatar = (name: string, bg: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=ffffff&size=256&bold=true`;

export const traders = [
  { name: "Marcus Hale", username: "marcushale", specialization: "Stocks", specialties: ["US large-cap equities", "Earnings plays", "Dividend growth"], tradingStyle: "Swing Trading", riskLevel: "Low", experience: 12, totalTrades: 1840, winRate: 74, totalCopiers: 2310, monthly: 3.6, yearly: 41.8, averageHoldingTime: "2 weeks", minimumCopyAmount: 1000, copierFee: 10, bg: "1d4ed8", bio: "Former sell-side analyst trading S&P 500 leaders around earnings with tight risk controls." },
  { name: "Nadia Volkov", username: "nadiavolkov", specialization: "Crypto", specialties: ["Crypto swing", "BTC & ETH", "Momentum breakouts"], tradingStyle: "Swing Trading", riskLevel: "High", experience: 7, totalTrades: 2650, winRate: 69, totalCopiers: 3120, monthly: 8.9, yearly: 112.4, averageHoldingTime: "4 days", minimumCopyAmount: 2500, copierFee: 15, bg: "7c3aed", bio: "Rides multi-day crypto trends on BTC, ETH and SOL using on-chain flows and market structure." },
  { name: "Lucas Brennan", username: "lucasbrennan", specialization: "Crypto", specialties: ["DeFi yield", "On-chain analytics", "Stablecoin strategies"], tradingStyle: "Position Trading", riskLevel: "Medium", experience: 6, totalTrades: 920, winRate: 77, totalCopiers: 1480, monthly: 5.2, yearly: 63.5, averageHoldingTime: "3 weeks", minimumCopyAmount: 1500, copierFee: 12, bg: "059669", bio: "Allocates across blue-chip DeFi protocols, rotating yield and tracking smart-money wallets." },
  { name: "Elena Marquez", username: "elenamarquez", specialization: "Indices", specialties: ["ETFs", "Global macro", "Sector rotation"], tradingStyle: "Position Trading", riskLevel: "Low", experience: 15, totalTrades: 760, winRate: 79, totalCopiers: 1950, monthly: 2.4, yearly: 28.9, averageHoldingTime: "1 month", minimumCopyAmount: 500, copierFee: 8, bg: "0f766e", bio: "Macro-driven ETF allocator rotating between sectors, bonds and gold as the cycle turns." },
  { name: "Daniel Weber", username: "danielweber", specialization: "Forex", specialties: ["FX majors", "Commodities", "Gold & oil"], tradingStyle: "Day Trading", riskLevel: "Medium", experience: 9, totalTrades: 4380, winRate: 66, totalCopiers: 1270, monthly: 4.7, yearly: 52.3, averageHoldingTime: "6 hours", minimumCopyAmount: 750, copierFee: 12, bg: "b45309", bio: "Intraday FX-style trader on majors, gold and crude around central-bank and data releases." },
  { name: "Priya Raman", username: "priyaraman", specialization: "Stocks", specialties: ["AI & tech growth", "Semiconductors", "Innovation ETFs"], tradingStyle: "Swing Trading", riskLevel: "High", experience: 8, totalTrades: 1520, winRate: 71, totalCopiers: 2780, monthly: 7.1, yearly: 89.6, averageHoldingTime: "10 days", minimumCopyAmount: 2000, copierFee: 15, bg: "be185d", bio: "Concentrated growth book focused on AI infrastructure, chips and high-momentum tech names." },
  { name: "Viktor Lindqvist", username: "viktorlindqvist", specialization: "Mixed", specialties: ["Quant", "Arbitrage", "Multi-asset"], tradingStyle: "Scalping", riskLevel: "Medium", experience: 11, totalTrades: 12450, winRate: 82, totalCopiers: 3640, monthly: 6.3, yearly: 84.2, averageHoldingTime: "45 minutes", minimumCopyAmount: 5000, copierFee: 20, bg: "334155", bio: "Systematic quant running statistical-arbitrage and market-neutral models across crypto and equities." },
];

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  // Rename earlier seeded docs in place (keeps _id, stats and copiers) instead of creating duplicates.
  const renames = [
    { from: "Kofi Mensah", to: "Lucas Brennan", username: "lucasbrennan" },
    { from: "Daniel Okoro", to: "Daniel Weber", username: "danielweber" },
  ];
  for (const r of renames) {
    if (await Trader.exists({ name: r.to })) continue;
    const res = await Trader.updateOne({ name: r.from }, { $set: { name: r.to, username: r.username } });
    if (res.modifiedCount) console.log(`renamed ${r.from} -> ${r.to}`);
  }
  for (const t of traders) {
    const { bg, monthly, yearly, ...rest } = t;
    await Trader.updateOne(
      { name: t.name },
      { $set: { ...rest, profileImage: avatar(t.name, bg), profitPercentage: { monthly, yearly }, status: "active" } },
      { upsert: true },
    );
    console.log(`upserted ${t.name}`);
  }
  console.log(`total traders: ${await Trader.countDocuments()}`);
  await mongoose.disconnect();
}

main().catch(async (error) => { console.error(error instanceof Error ? error.message : error); await mongoose.disconnect(); process.exit(1); });
