import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Quote = {
	price: number;
	changePercent: number;
	volume?: number;
	timestamp?: number;
};

type MiniSeriesPoint = { value: number; time?: number };

type MarketState = {
	quotes: Record<string, Quote>;
	series: Record<string, MiniSeriesPoint[]>;
};

const initialState: MarketState = {
	quotes: {},
	series: {},
};

const MAX_POINTS = 120;

export const marketSlice = createSlice({
	name: "market",
	initialState,
	reducers: {
		setQuote(state, action: PayloadAction<{ symbol: string; quote: Quote }>) {
			const { symbol, quote } = action.payload;
			state.quotes[symbol.toUpperCase()] = quote;
		},
		appendPoint(state, action: PayloadAction<{ symbol: string; point: MiniSeriesPoint }>) {
			const symbol = action.payload.symbol.toUpperCase();
			const current = state.series[symbol] || [];
			const next = [...current, action.payload.point].slice(-MAX_POINTS);
			state.series[symbol] = next;
		},
		resetSeries(state, action: PayloadAction<{ symbol: string }>) {
			delete state.series[action.payload.symbol.toUpperCase()];
		},
	},
});

export const { setQuote, appendPoint, resetSeries } = marketSlice.actions;
export default marketSlice.reducer;

