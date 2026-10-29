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

const clean = (n: number) => {
	const v = Number(n);
	return Number.isFinite(v) && v !== 0 ? v : 0; // NaN/Infinity/-0 -> 0
};
export const usd = (n: number, max = 2) => {
	const v = clean(n);
	const s = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: Math.min(2, max), maximumFractionDigits: max });
	return `${v < 0 && Number(s.replace(/,/g, "")) !== 0 ? "-" : ""}$${s}`;
};
/** Unit price: 2dp at >= $1, otherwise 4 significant digits (PEPE/SHIB never show as $0.000000 or 1e-8). */
export const price = (n: number) => {
	const v = clean(n);
	if (Math.abs(v) >= 1 || v === 0) return usd(v);
	return `$${Math.abs(v).toLocaleString("en-US", { maximumSignificantDigits: 4, minimumSignificantDigits: 2 })}`;
};
/** Signed percent without "-0.00%". */
export const pct = (n: number, d = 2) => {
	const v = Number(clean(n).toFixed(d));
	return `${v > 0 ? "+" : v < 0 ? "-" : ""}${Math.abs(v).toFixed(d)}%`;
};
export const qty = (n: number) => {
	const v = clean(n);
	const a = Math.abs(v);
	return v.toLocaleString("en-US", a >= 1 || a === 0 ? { maximumFractionDigits: 4 } : { maximumSignificantDigits: 6 });
};
