import { apiGet } from "@/lib/api";

export type Holding = {
	symbol: string; name: string; type: "cash" | "crypto" | "stock";
	quantity: number; spot: number; funding: number;
	price: number; value: number; allocation: number; change24h: number; dayChange: number;
	priced: boolean; dust: boolean;
	costBasis: number | null; avgCost: number | null; pnl: number | null; pnlPercent: number | null;
};
export type Portfolio = {
	currency: "USD"; totalValue: number; cashValue: number; investedValue: number; buyingPower: number;
	dayChange: number; dayChangePercent: number; unrealizedPnl: number | null; unpricedSymbols: string[];
	holdings: Holding[]; pricedAt: string;
};

export const fetchPortfolio = () => apiGet<Portfolio>("/api/portfolio");

export const usd = (n: number, max = 2) =>
	`$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: Math.min(2, max), maximumFractionDigits: max })}`;
export const qty = (n: number) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: n >= 1 ? 4 : 8 });
