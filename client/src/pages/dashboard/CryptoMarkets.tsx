import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";
import { AssetLogo } from "@/components/common/asset-logo";
import { PriceAreaChart } from "@/components/charts/price-area-chart";
import { buildFallbackSeries } from "@/lib/series";
import { useLiveQuote } from "@/hooks/useLiveQuote";
import { fetchCryptoHistorical } from "@/lib/historical";

interface Crypto {
	_id: string;
	symbol: string;
	name: string;
	price: number;
	change24h: number;
	low24h: number;
	high24h: number;
	volume24h: number;
	image?: string;
	chartData: { value: number }[];
}

const toNumber = (val: any, fallback = 0) => {
	const n = Number(val);
	return Number.isFinite(n) ? n : fallback;
};

const mergeSeries = (base: { value: number }[] = [], live: any[] = []) => {
	const livePoints = live.filter((p) => (p as any).value > 0).map((p) => ({ value: (p as any).value }));
	if (!livePoints.length) return base;
	const tailBase = (base || []).slice(-50); // keep shape
	const tailLive = livePoints.slice(-10); // small live tail
	return [...tailBase, ...tailLive];
};

const getBandForSymbol = (symbol: string) => {
	const sym = symbol.toUpperCase();
	if (sym === "USDT" || sym === "USDC") return 0.02;
	const majors = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "AVAX", "MATIC"];
	if (majors.includes(sym)) return 0.08;
	return 0.12;
};

const chartCache = new Map<string, { value: number }[]>();

const getCachedSeries = (symbol: string) => {
	const cached = chartCache.get(symbol);
	if (cached?.length) return cached;
	try {
		const stored = sessionStorage.getItem(`cryptoSeries-${symbol}`);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (Array.isArray(parsed) && parsed.length) {
				chartCache.set(symbol, parsed);
				return parsed;
			}
		}
	} catch {}
	return undefined;
};

function CryptoCard({
	crypto,
	onNavigate,
	formatVolume,
	formatMarketCap,
}: {
	crypto: Crypto;
	onNavigate: (path: string) => void;
	formatVolume: (v: number) => string;
	formatMarketCap: (price: number, volume: number) => string;
}) {
	const live = useLiveQuote(crypto.symbol, "crypto");
	const currentPrice = live.quote?.price ?? crypto.price;
	const changePercent = live.quote?.changePercent ?? crypto.change24h;
	const hasPrice = currentPrice > 0;
	const isPositive = changePercent >= 0;
	// Keep the cached/historical shape and blend in a short live tail
	const chartData = mergeSeries(crypto.chartData, live.series || []);

	return (
		<Card
			key={crypto._id}
			variant="elevated"
			padding="none"
			className="overflow-hidden cursor-pointer hover:shadow-depth-lg transition-all group"
			onClick={() => onNavigate(`/dashboard/crypto/${crypto.symbol}`)}
		>
			{/* Header with Logo */}
			<div className="p-4 pb-3">
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center gap-3">
						<AssetLogo symbol={crypto.symbol} name={crypto.name} type="crypto" size={40} containerClassName="bg-white" />
						<div>
							<h3 className="font-bold text-lg">{crypto.symbol}</h3>
							<p className="text-xs text-muted-foreground truncate max-w-[120px]">
								{crypto.name}
							</p>
						</div>
					</div>
					{hasPrice ? (
						<Badge variant={isPositive ? "default" : "destructive"} className="gap-1">
							{isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
							<span>
								{isPositive ? "+" : ""}
								{changePercent.toFixed(2)}%
							</span>
						</Badge>
					) : (
						<Badge variant="outline" className="gap-1">N/A</Badge>
					)}
				</div>
			</div>

			{/* Chart with Gradient */}
			<div className="h-24 relative">
				<PriceAreaChart
					symbol={crypto.symbol}
					data={chartData}
					isPositive={isPositive}
					variant="compact"
					height="100%"
					showGrid={false}
				/>
			</div>

			{/* Footer */}
			<div className="p-4 pt-3 border-t border-border/50">
				<div className="flex items-end justify-between">
					<div>
						<p className="text-2xl font-bold">
							{hasPrice
								? `$${currentPrice.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: currentPrice < 1 ? 4 : 2,
								  })}`
								: "—"}
						</p>
						{hasPrice && (
							<p className={cn("text-sm font-medium", isPositive ? "text-green-600" : "text-red-600")}>
								{isPositive ? "+" : ""}${Math.abs((currentPrice * changePercent) / 100).toFixed(currentPrice < 1 ? 4 : 2)}
							</p>
						)}
					</div>
					<Button
						variant="outline"
						size="sm"
						className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={(e) => {
							e.stopPropagation();
							onNavigate(`/dashboard/trade?symbol=${crypto.symbol}&type=crypto`);
						}}
					>
						Trade
					</Button>
				</div>
				<div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
					<span>Vol: {formatVolume(crypto.volume24h)}</span>
					<span>MCap: ${formatMarketCap(currentPrice, crypto.volume24h)}</span>
				</div>
			</div>
		</Card>
	);
}

export default function CryptoMarketsPage() {
	const navigate = useNavigate();
	const [cryptos, setCryptos] = useState<Crypto[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"price" | "change" | "volume">("price");

	useEffect(() => {
		fetchCryptos();

		// The server caches provider quotes; avoid wasteful browser polling.
		const interval = setInterval(fetchCryptos, 60000);
		return () => clearInterval(interval);
	}, []);

	const fetchCryptos = async () => {
		try {
			console.log("[CRYPTO MARKETS] ========== Fetching crypto data ==========");
			const data = await apiGet<any[]>("/api/coins");

			// Filter out USDT
			const filteredData = data.filter((c: any) => c.symbol !== "USDT");
			console.log(`[CRYPTO MARKETS] Fetched ${filteredData.length} cryptos`);

			// Fetch historical data only for coins we don't already have cached
			// The server deduplicates and persistently caches each history series, so
			// every card can retain a real chart without repeating provider calls.
			const symbolsNeedingHistory = filteredData.filter((coin: any) => !getCachedSeries(coin.symbol));
			let historicalMap: Record<string, { value: number }[]> = {};
			if (symbolsNeedingHistory.length) {
				console.log("[CRYPTO MARKETS] Fetching historical data for missing cryptos...");
				const historicalResults = await Promise.all(
					symbolsNeedingHistory.map((coin: any) =>
						fetchCryptoHistorical(coin.symbol, 365)
							.then(data => ({ symbol: coin.symbol, data }))
							.catch(() => ({ symbol: coin.symbol, data: [] }))
					)
				);
				historicalMap = Object.fromEntries(historicalResults.map((r) => [r.symbol, r.data]));
			}

			// Map to Crypto interface with real historical data
			const cryptoList = filteredData.map((coin: any) => {
				const price = toNumber(coin.price, 0);
				const change24h = toNumber(coin.change24h, 0);
				const historicalData = historicalMap[coin.symbol] || [];

				let chartData: { value: number }[] = getCachedSeries(coin.symbol) || [];
				if (chartData.length === 0) {
					chartData =
						historicalData.length > 0
							? historicalData
							: generateChartData(coin.symbol, price, change24h, getBandForSymbol(coin.symbol));
					chartCache.set(coin.symbol, chartData);
					try {
						sessionStorage.setItem(`cryptoSeries-${coin.symbol}`, JSON.stringify(chartData));
					} catch {}
				}

				console.log(`[CRYPTO MARKETS] ${coin.symbol}: ${historicalData.length > 0 ? "✅ REAL" : "⚠️ FALLBACK"} data (${chartData.length} points)`);

				return {
					_id: coin._id,
					symbol: coin.symbol,
					name: coin.name,
					price,
					change24h,
					low24h: toNumber(coin.low24h, 0),
					high24h: toNumber(coin.high24h, 0),
					volume24h: toNumber(coin.volume24h, 0),
					image: coin.image || getLogoUrl(coin.symbol),
					chartData: chartData || [],
				};
			});

			console.log(`[CRYPTO MARKETS] ========== Loaded ${cryptoList.length} cryptos ==========\n`);
			setCryptos(cryptoList);
		} catch (error) {
			console.error("Failed to fetch cryptos:", error);
			toast.error("Failed to load cryptocurrency data");
		} finally {
			setLoading(false);
		}
	};

	const getLogoUrl = (symbol: string) => {
		// Fallback logo URLs
		const logoMap: Record<string, string> = {
			BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
			ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
			BNB: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
			SOL: "https://cryptologos.cc/logos/solana-sol-logo.png",
			ATOM: "https://cryptologos.cc/logos/cosmos-atom-logo.png",
			XRP: "https://cryptologos.cc/logos/xrp-xrp-logo.png",
			ADA: "https://cryptologos.cc/logos/cardano-ada-logo.png",
			DOGE: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
			AVAX: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
		};

		return logoMap[symbol] || `https://www.google.com/s2/favicons?domain=${symbol.toLowerCase()}.com&sz=128`;
	};

	const generateChartData = (symbol: string, currentPrice: number, changePercent: number, minBand: number) => {
		if (!currentPrice || currentPrice <= 0) {
			return Array.from({ length: 40 }, () => ({ value: 0 }));
		}
		return buildFallbackSeries(currentPrice, changePercent, 80, {
			minBand,
			spikeChance: 0.14,
			spikeIntensity: 3,
			seed: `crypto-${symbol}`,
		});
	};

	const formatVolume = (volume: number) => {
		if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
		if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
		if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
		return volume.toFixed(2);
	};

	const formatMarketCap = (price: number, volume: number) => {
		// Rough estimation: market cap ≈ volume * some multiplier
		const estimatedCap = volume * 100;
		if (estimatedCap >= 1e12) return `${(estimatedCap / 1e12).toFixed(2)}T`;
		if (estimatedCap >= 1e9) return `${(estimatedCap / 1e9).toFixed(2)}B`;
		if (estimatedCap >= 1e6) return `${(estimatedCap / 1e6).toFixed(2)}M`;
		return `${estimatedCap.toFixed(2)}`;
	};

	const filteredAndSortedCryptos = cryptos
		.filter(
			(crypto) =>
				crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
				crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
		.sort((a, b) => {
			if (sortBy === "change") {
				return b.change24h - a.change24h;
			}
			if (sortBy === "volume") {
				return b.volume24h - a.volume24h;
			}
			return b.price - a.price;
		});

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin mx-auto text-accent-500" />
					<p className="text-sm text-muted-foreground">Loading cryptocurrency data...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 max-w-[1400px] mx-auto">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">Cryptocurrency</h1>
					<p className="text-sm text-muted-foreground">
						Trade crypto 24/7 with zero commissions
					</p>
				</div>
				<div className="flex gap-2">
					<select
						className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as any)}
					>
						<option value="price">Price (High to Low)</option>
						<option value="change">Top Movers</option>
						<option value="volume">Volume (High to Low)</option>
					</select>
				</div>
			</div>

			{/* Search */}
			<Card variant="elevated" padding="md">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search cryptocurrency..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
			</Card>

			{/* Crypto Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{filteredAndSortedCryptos.map((crypto) => (
					<CryptoCard
						key={crypto._id}
						crypto={crypto}
						formatVolume={formatVolume}
						formatMarketCap={formatMarketCap}
						onNavigate={(path) => navigate(path)}
					/>
				))}
			</div>

			{/* Empty State */}
			{filteredAndSortedCryptos.length === 0 && (
				<Card variant="elevated" padding="xl">
					<div className="text-center space-y-4">
						<p className="text-muted-foreground">
							No cryptocurrency found matching "{searchQuery}"
						</p>
						<Button variant="outline" onClick={() => setSearchQuery("")}>
							Clear Search
						</Button>
					</div>
				</Card>
			)}
		</div>
	);
}

