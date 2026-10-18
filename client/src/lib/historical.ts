import { apiGet } from "./api";

export type HistoricalDataPoint = {
	value: number;
	time: number;
};

const normalizeCryptoHistory = (payload: any): HistoricalDataPoint[] => {
	const rows = payload?.Data?.Data || [];
	return rows
		.map((row: any) => ({ time: Number(row.time) * 1000, value: Number(row.close) }))
		.filter((row: HistoricalDataPoint) => Number.isFinite(row.time) && Number.isFinite(row.value));
};

export const fetchCryptoHistorical = async (
	symbol: string,
	days: number = 7,
): Promise<HistoricalDataPoint[]> => {
	const endpoint = days <= 1 ? "histominute" : days <= 7 ? "histohour" : "histoday";
	const limit = days <= 1 ? 1440 : days <= 7 ? days * 24 : days;
	const payload = await apiGet<any>(
		`/api/market/crypto/historical?endpoint=${endpoint}&symbol=${encodeURIComponent(symbol)}&currency=USD&limit=${limit}`,
	);
	return normalizeCryptoHistory(payload);
};

export const fetchStockHistorical = async (
	symbol: string,
	days: number = 365,
): Promise<HistoricalDataPoint[]> => {
	const timeframe = days <= 1 ? "1D" : days <= 7 ? "5D" : days <= 31 ? "1M" : "1Y";
	const payload = await apiGet<any>(
		`/api/market/stock/historical?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`,
	);
	return (payload?.data || []).map((row: any) => ({
		time: Number(row.time) * 1000,
		value: Number(row.close),
	}));
};

export const fetchAssetHistorical = (
	symbol: string,
	type: "stock" | "crypto",
	days: number = 7,
) => type === "crypto" ? fetchCryptoHistorical(symbol, days) : fetchStockHistorical(symbol, days);
