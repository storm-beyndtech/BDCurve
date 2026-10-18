import { useEffect } from "react";
import { connectWs, subscribeMarketSymbol } from "@/lib/wsClient";
import { useAppSelector } from "./useTypedRedux";

type AssetType = "stock" | "crypto";

export const useLiveQuote = (symbol: string, type: AssetType = "stock") => {
	const upper = symbol?.toUpperCase();
	const quote = useAppSelector((s) => (upper ? s.market.quotes[upper] : undefined));
	const series = useAppSelector((s) => (upper ? s.market.series[upper] : []));
	const status = useAppSelector((s) => s.ws.status);

	useEffect(() => {
		connectWs();
	}, []);

	useEffect(() => {
		if (type === "crypto" && upper) subscribeMarketSymbol(upper);
	}, [type, upper]);

	return { quote, series, status };
};
