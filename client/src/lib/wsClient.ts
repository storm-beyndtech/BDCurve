import { store } from "@/store";
import { appendPoint, setQuote } from "@/store/slices/marketSlice";
import { setError, setStatus } from "@/store/slices/wsSlice";

const configuredUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL;
const WS_URL = configuredUrl
	? configuredUrl.replace(/^http/, "ws").replace(/\/$/, "")
	: `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;

type CryptoPayload = {
	symbol: string;
	price?: number;
	change?: number;
	volume?: number;
	time?: number;
};

let socket: WebSocket | null = null;
let heartbeat: number | undefined;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const subscriptions = new Map<string, number>();

const startHeartbeat = () => {
	stopHeartbeat();
	heartbeat = window.setInterval(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ type: "ping", t: Date.now() }));
		}
	}, 30000);
};

const stopHeartbeat = () => {
	if (heartbeat) {
		clearInterval(heartbeat);
		heartbeat = undefined;
	}
};

export const connectWs = () => {
	if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
		return;
	}

	if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
		console.warn("Max WebSocket reconnection attempts reached");
		store.dispatch(setError("Unable to connect to live market data"));
		return;
	}

	store.dispatch(setStatus("connecting"));

	socket = new WebSocket(WS_URL);

	socket.onopen = () => {
		reconnectAttempts = 0; // Reset on successful connection
		store.dispatch(setStatus("connected"));
		store.dispatch(setError(undefined));
		startHeartbeat();
		if (subscriptions.size) {
			socket?.send(JSON.stringify({ type: "subscribe", symbols: [...subscriptions.keys()] }));
		}
	};

	socket.onerror = (err) => {
		store.dispatch(setStatus("disconnected"));
		store.dispatch(setError("WebSocket error"));
		stopHeartbeat();
		console.error("WS error", err);
	};

	socket.onclose = () => {
		store.dispatch(setStatus("disconnected"));
		stopHeartbeat();
		if (subscriptions.size) {
			reconnectAttempts++;
			const delay = Math.min(2000 * reconnectAttempts, 10000);
			setTimeout(connectWs, delay);
		}
	};

	socket.onmessage = (event) => {
		try {
			const data: CryptoPayload = JSON.parse(event.data);
			const symbol = data.symbol || (data as any).FROMSYMBOL;
			const price = data.price ?? (data as any).PRICE;
			const changePercent = data.change ?? (data as any).changePercent ?? 0;
			const volume = data.volume ?? (data as any).VOLUME24HOURTO;
			const timestamp = data.time || Date.now();

			if (!symbol || price === undefined) return;

			store.dispatch(
				setQuote({
					symbol,
					quote: {
						price,
						changePercent,
						volume,
						timestamp,
					},
				}),
			);
			store.dispatch(
				appendPoint({
					symbol,
					point: { value: price, time: timestamp },
				}),
			);
		} catch (error) {
			console.error("WS parse error", error);
		}
	};
};

export const subscribeMarketSymbol = (symbol: string) => {
	const normalized = symbol.toUpperCase().replace(/[^A-Z0-9]/g, "");
	if (!normalized) return;
	const current = subscriptions.get(normalized) || 0;
	subscriptions.set(normalized, current + 1);
	connectWs();
	if (current === 0 && socket?.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({ type: "subscribe", symbols: [normalized] }));
	}
};

export const unsubscribeMarketSymbol = (symbol: string) => {
	const normalized = symbol.toUpperCase().replace(/[^A-Z0-9]/g, "");
	const current = subscriptions.get(normalized) || 0;
	if (current > 1) {
		subscriptions.set(normalized, current - 1);
		return;
	}
	if (!subscriptions.delete(normalized)) return;
	if (socket?.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({ type: "unsubscribe", symbols: [normalized] }));
	}
	if (subscriptions.size === 0) disconnectWs();
};

export const disconnectWs = () => {
	stopHeartbeat();
	if (socket) {
		socket.close();
		socket = null;
	}
};

