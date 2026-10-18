import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ConnectionState = "disconnected" | "connecting" | "connected";

type WsState = {
	status: ConnectionState;
	lastError?: string;
	subscriptions: Record<string, "crypto" | "stock">;
};

const initialState: WsState = {
	status: "disconnected",
	subscriptions: {},
};

const wsSlice = createSlice({
	name: "ws",
	initialState,
	reducers: {
		setStatus(state, action: PayloadAction<ConnectionState>) {
			state.status = action.payload;
		},
		setError(state, action: PayloadAction<string | undefined>) {
			state.lastError = action.payload;
		},
		subscribeSymbol(state, action: PayloadAction<{ symbol: string; type: "crypto" | "stock" }>) {
			state.subscriptions[action.payload.symbol.toUpperCase()] = action.payload.type;
		},
		unsubscribeSymbol(state, action: PayloadAction<{ symbol: string }>) {
			delete state.subscriptions[action.payload.symbol.toUpperCase()];
		},
		resetSubscriptions(state) {
			state.subscriptions = {};
		},
	},
});

export const { setStatus, setError, subscribeSymbol, unsubscribeSymbol, resetSubscriptions } =
	wsSlice.actions;
export default wsSlice.reducer;

