import { useEffect } from "react";
import { subscribeMarketSymbol, unsubscribeMarketSymbol } from "@/lib/wsClient";
import { useAppSelector } from "./useTypedRedux";

type AssetType = "stock" | "crypto";

export const useLiveQuote = (symbol: string, type: AssetType = "stock", enabled = true) => {
	const upper = symbol?.toUpperCase();
	const quote = useAppSelector((s) => (upper ? s.market.quotes[upper] : undefined));
	const series = useAppSelector((s) => (upper ? (s.market.series[upper] || []) : []));
	const status = useAppSelector((s) => s.ws.status);

	useEffect(() => {
		if (type !== "crypto" || !upper || !enabled) return;
		subscribeMarketSymbol(upper);
		return () => unsubscribeMarketSymbol(upper);
	}, [type, upper, enabled]);

	return { quote, series, status };
};
