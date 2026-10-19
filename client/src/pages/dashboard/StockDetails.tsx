import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { PriceAreaChart } from "@/components/charts/price-area-chart";
import { AssetLogo } from "@/components/common/asset-logo";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";
import { buildFallbackSeries } from "@/lib/series";
import { useLiveQuote } from "@/hooks/useLiveQuote";

type Timeframe = "1D" | "1W" | "1M" | "1Y";

type Candle = { time: number; close?: number; c?: number };

type AssetData = {
	type: "stock" | "crypto";
	symbol: string;
	name: string;
	sector?: string;
	industry?: string;
	description?: string;
	currentPrice: number;
	changePercent: number;
	changeAmount?: number;
	open?: number;
	high?: number;
	low?: number;
	prevClose?: number;
	volume?: number;
	avgVolume?: number;
	marketCap?: number | string;
	dominance?: number;
	rank?: number;
	maxSupply?: number;
	circulatingSupply?: number;
	chartData: { value: number; time?: number }[];
	week52High?: number;
	week52Low?: number;
	beta?: number;
	peRatio?: number;
	eps?: number;
	dividend?: number;
	dividendYield?: number;
	ceo?: string;
	founded?: string;
	employees?: number | string;
	headquarters?: string;
	creator?: string;
};

const timeframeToCryptoEndpoint: Record<Timeframe, { endpoint: string; limit: number }> = {
	"1D": { endpoint: "histominute", limit: 1440 },
	"1W": { endpoint: "histohour", limit: 24 * 7 },
	"1M": { endpoint: "histoday", limit: 30 },
	"1Y": { endpoint: "histoday", limit: 365 },
};

const timeframeToStockParam: Record<Timeframe, string> = {
	"1D": "1D",
	"1W": "5D",
	"1M": "1M",
	"1Y": "1Y",
};

const mapHistoricalToSeries = (candles: Candle[]) =>
	candles.map((c) => ({
		value: c.close ?? c.c ?? 0,
		time: c.time,
	}));

const getBandForSymbol = (symbol: string) => {
	const sym = symbol.toUpperCase();
	if (sym === "USDT" || sym === "USDC") return 0.02;
	const majors = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "AVAX", "MATIC"];
	if (majors.includes(sym)) return 0.06;
	return 0.1;
};

const fallbackPoints = (tf: Timeframe) => {
	switch (tf) {
		case "1Y":
			return 180;
		case "1M":
			return 90;
		case "1W":
			return 60;
		default:
			return 48;
	}
};

export default function StockDetailsPage() {
	const { symbol } = useParams<{ symbol: string }>();
	const navigate = useNavigate();
	const [isInWatchlist, setIsInWatchlist] = useState(true);
	// Default to yearly for maximum spikes and variation
	const [timeframe, setTimeframe] = useState<Timeframe>("1Y");
	const [asset, setAsset] = useState<AssetData | null>(null);
	const [loading, setLoading] = useState(false);

	const upperSymbol = useMemo(() => symbol?.toUpperCase() ?? "", [symbol]);
	const live = useLiveQuote(upperSymbol, asset?.type || "stock", asset?.type === "crypto");

	useEffect(() => {
		if (!live.quote || !asset || asset.type !== "crypto") return;
		setAsset((current) => current ? {
			...current,
			currentPrice: live.quote!.price,
			changePercent: live.quote!.changePercent,
			volume: live.quote!.volume ?? current.volume,
			chartData: live.series.length
				? [...current.chartData.slice(-180), ...live.series.slice(-20).map((point) => ({ value: point.value, time: point.time }))]
				: current.chartData,
		} : current);
	}, [live.quote, live.series]);

	useEffect(() => {
		if (!upperSymbol) return;

		const loadAsset = async () => {
			setLoading(true);
			try {
				// Check crypto list first to decide asset type
				const coins: any[] = (await apiGet<any[]>("/api/coins").catch(() => [])) || [];
				const coin = coins.find((c) => c.symbol === upperSymbol);

				if (coin) {
					console.log(`[CRYPTO HIST CLIENT] ========== Fetching ${upperSymbol} ==========`);
					const safePrice = Number.isFinite(coin.price) && coin.price > 0 ? coin.price : 0;
					const safeChange = Number.isFinite(coin.change24h) ? coin.change24h : 0;
					console.log(`[CRYPTO HIST CLIENT] ${upperSymbol} price: ${safePrice}, change: ${safeChange}%`);

					const { endpoint, limit } = timeframeToCryptoEndpoint[timeframe];
					console.log(`[CRYPTO HIST CLIENT] Requesting CryptoCompare: endpoint=${endpoint}, symbol=${upperSymbol}, limit=${limit}`);

					const hist = await apiGet<any>(
						`/api/market/crypto/historical?endpoint=${endpoint}&symbol=${upperSymbol}&currency=USD&limit=${limit}`
					).catch((err) => {
						console.error(`[CRYPTO HIST CLIENT] CryptoCompare API failed for ${upperSymbol}:`, err);
						return null;
					});

					let chartData = (hist?.Data?.Data && mapHistoricalToSeries(hist.Data.Data)) || [];
					console.log(`[CRYPTO HIST CLIENT] CryptoCompare returned ${chartData.length} points for ${upperSymbol}`);

					if (hist?.Data?.Data && chartData.length > 0) {
						console.log(`[CRYPTO HIST CLIENT] ✅ ${upperSymbol} using CryptoCompare data (${chartData.length} points)`);
					}

					if (!chartData.length) {
						console.warn(`[CRYPTO HIST CLIENT] ⚠️ ${upperSymbol} no historical data available`);
						chartData = Array.from({ length: fallbackPoints(timeframe) }, (_, i) => ({ value: 0, time: i }));
					}

					console.log(`[CRYPTO HIST CLIENT] ========== Final ${upperSymbol}: ${chartData.length} points ==========\n`);

					setAsset({
						type: "crypto",
						symbol: coin.symbol,
						name: coin.name || coin.symbol,
						sector: "Cryptocurrency",
						industry: "Digital Currency",
						description: coin.description || "Digital asset",
						currentPrice: safePrice,
						changePercent: safeChange,
						changeAmount: (safePrice * safeChange) / 100,
						open: coin.open || safePrice,
						high: coin.high24h || safePrice,
						low: coin.low24h || safePrice,
						prevClose: coin.prevClose || safePrice,
						volume: coin.volume24h,
						avgVolume: coin.volume24h,
						marketCap: coin.marketCap || coin.volume24h,
						dominance: coin.dominance,
						rank: coin.rank,
						maxSupply: coin.maxSupply,
						circulatingSupply: coin.circulatingSupply,
						chartData,
					});
					return;
				}

				// Stock path
				const [profile, quote, historical] = await Promise.all([
					apiGet<any>(`/api/market/stock/profile?symbol=${upperSymbol}`).catch(() => null),
					apiGet<any>(`/api/market/stock/quote?symbol=${upperSymbol}`).catch(() => null),
					apiGet<any>(
						`/api/market/stock/historical?symbol=${upperSymbol}&timeframe=${timeframeToStockParam[timeframe]}`
					).catch(() => null),
				]);

				const candles: Candle[] = historical?.data || [];

				const price = quote?.price ?? profile?.price ?? 0;
				const changePercent = quote?.changePercent ?? 0;
				const chartData =
					candles.length > 0
						? mapHistoricalToSeries(candles)
						: Array.from({ length: fallbackPoints(timeframe) }, (_, i) => ({ value: 0, time: i }));

				const selected = {
					type: "stock" as const,
					symbol: profile?.symbol || upperSymbol,
					name: profile?.name || profile?.companyName || upperSymbol,
					sector: profile?.sector || "Equity",
					industry: profile?.industry,
					description: profile?.description,
					currentPrice: price,
					changePercent,
					changeAmount: quote?.change ?? (price && changePercent ? (price * changePercent) / 100 : 0),
					open: quote?.open ?? price,
					high: quote?.high ?? price,
					low: quote?.low ?? price,
					prevClose: quote?.previousClose ?? price,
					volume: quote?.volume,
					marketCap: profile?.marketCap,
					peRatio: profile?.peRatio,
					eps: profile?.eps,
					dividend: profile?.dividend,
					dividendYield: profile?.dividendYield,
					week52High: undefined,
					week52Low: undefined,
					beta: undefined,
					chartData,
					ceo: profile?.ceo,
					founded: profile?.founded,
					employees: profile?.employees,
					headquarters: profile?.headquarters,
				};

				setAsset(selected);
			} catch (error: any) {
				console.error("Failed to load asset", error);
				toast.error("Could not load live data.");
				setAsset({
					type: window.location.pathname.includes("/crypto/") ? "crypto" : "stock",
					symbol: upperSymbol,
					name: upperSymbol,
					currentPrice: 0,
					changePercent: 0,
					changeAmount: 0,
					chartData: Array.from({ length: fallbackPoints(timeframe) }, (_, i) => ({ value: 0, time: i })),
				});
			} finally {
				setLoading(false);
			}
		};

		loadAsset();
	}, [upperSymbol, timeframe]);

	const isCrypto = asset?.type === "crypto";
	const isPositive = (asset?.changePercent ?? 0) >= 0;
	const formatMoney = (value?: number | string, fraction = 2) => {
		if (value === undefined || value === null || value === "") return "--";
		const numeric = typeof value === "string" ? Number(value) : value;
		if (Number.isNaN(numeric)) return "--";
		return numeric.toLocaleString("en-US", {
			minimumFractionDigits: fraction,
			maximumFractionDigits: fraction,
		});
	};

	const formatPlain = (value?: number | string) => {
		if (value === undefined || value === null || value === "") return "--";
		return value;
	};

	const formatCompact = (value?: number | string) => {
		if (value === undefined || value === null || value === "") return "--";
		const numeric = typeof value === "string" ? Number(value) : value;
		if (Number.isNaN(numeric)) return value as any;
		return numeric.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 2 });
	};

	if (!upperSymbol) {
		return (
			<div className="space-y-6 max-w-[1400px] mx-auto">
				<Button variant="ghost" onClick={() => navigate("/dashboard/watchlist")}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back
				</Button>
				<Card variant="elevated" padding="xl">
					<div className="text-center">
						<p className="text-muted-foreground">Asset not found</p>
					</div>
				</Card>
			</div>
		);
	}

	if (loading || !asset) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-3">
					<Loader2 className="h-8 w-8 animate-spin mx-auto text-accent-500" />
					<p className="text-sm text-muted-foreground">Loading {upperSymbol}...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 max-w-[1400px] mx-auto">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" onClick={() => navigate(isCrypto ? "/dashboard/crypto-markets" : "/dashboard/stocks")}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back
				</Button>
			</div>

			{/* Stock Header */}
			<div className="flex flex-col lg:flex-row items-start justify-between gap-6">
				<div className="flex items-start gap-4">
					<AssetLogo symbol={asset.symbol} name={asset.name} type={isCrypto ? "crypto" : "stock"} size={64} />
					<div>
						<div className="flex items-center gap-3 mb-2">
							<h1 className="text-4xl font-bold">{asset.symbol}</h1>
							<Badge variant={isPositive ? "default" : "destructive"} className="gap-1">
								{isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
								<span>
									{isPositive ? "+" : ""}
									{asset.changePercent.toFixed(2)}%
								</span>
							</Badge>
						</div>
						<p className="text-lg text-muted-foreground mb-1">{asset.name}</p>
						<p className="text-sm text-muted-foreground">{asset.sector} | {asset.industry || "Digital Currency"}</p>
					</div>
				</div>
				<div className="flex gap-3">
					<Button
						variant="outline"
						onClick={() => setIsInWatchlist(!isInWatchlist)}
						className="gap-2"
					>
						{isInWatchlist ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
						{isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
					</Button>
					<Button
						variant="primary"
						onClick={() =>
							navigate(
								`/dashboard/trade?symbol=${asset.symbol}&type=${isCrypto ? "crypto" : "stock"}`
							)
						}
					>
						Trade {asset.symbol}
					</Button>
				</div>
			</div>

			{/* Price and Chart */}
			<Card variant="elevated" padding="lg">
				<div className="space-y-6">
					<div className="flex items-baseline justify-between">
						<div>
							<p className="text-sm text-muted-foreground mb-1">Current Price</p>
					<div className="flex items-baseline gap-3">
						<p className="text-5xl font-bold">
							$
							{formatMoney(asset.currentPrice)}
						</p>
								<p
									className={cn(
										"text-2xl font-semibold",
										isPositive ? "text-green-600" : "text-red-600"
									)}
								>
									{isPositive ? "+" : ""}$
									{formatMoney(Math.abs(asset.changeAmount ?? 0))}
								</p>
							</div>
						</div>
						{/* Timeframe Selector */}
						<div className="flex gap-2">
							{(["1D", "1W", "1M", "1Y"] as const).map((tf) => (
								<Button
									key={tf}
									variant={timeframe === tf ? "primary" : "outline"}
									size="sm"
									onClick={() => setTimeframe(tf)}
								>
									{tf}
								</Button>
							))}
						</div>
					</div>

					{/* Large Chart with Gradient */}
					<PriceAreaChart
						symbol={asset.symbol}
						data={asset.chartData}
						isPositive={isPositive}
						variant="full"
						height={384}
						showGrid
					/>
				</div>
			</Card>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				<Card variant="elevated" padding="md">
					<p className="text-xs text-muted-foreground mb-1">Open</p>
					<p className="text-xl font-bold">${formatMoney(asset.open)}</p>
				</Card>
				<Card variant="elevated" padding="md">
					<p className="text-xs text-muted-foreground mb-1">High</p>
					<p className="text-xl font-bold text-green-600">${formatMoney(asset.high)}</p>
				</Card>
				<Card variant="elevated" padding="md">
					<p className="text-xs text-muted-foreground mb-1">Low</p>
					<p className="text-xl font-bold text-red-600">${formatMoney(asset.low)}</p>
				</Card>
				<Card variant="elevated" padding="md">
					<p className="text-xs text-muted-foreground mb-1">Volume</p>
					<p className="text-xl font-bold whitespace-nowrap">{formatCompact(asset.volume)}</p>
				</Card>
				<Card variant="elevated" padding="md">
					<p className="text-xs text-muted-foreground mb-1">Market Cap</p>
					<p className="text-xl font-bold">
						{typeof asset.marketCap === "number"
							? asset.marketCap.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 2 })
							: `$${formatPlain(asset.marketCap)}`}
					</p>
				</Card>
				<Card variant="elevated" padding="md">
					<p className="text-xs text-muted-foreground mb-1">52W High</p>
					<p className="text-xl font-bold">${formatMoney(asset.week52High)}</p>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* About Section */}
				<div className="lg:col-span-2">
					<Card variant="elevated" padding="lg">
						<h3 className="text-lg font-semibold mb-4">About {asset.name}</h3>
						<p className="text-muted-foreground leading-relaxed mb-6">
							{asset.description}
						</p>
						<div className="grid grid-cols-2 gap-4">
							{isCrypto ? (
								<>
									<div>
										<p className="text-sm text-muted-foreground mb-1">Creator</p>
										<p className="font-semibold">{asset.creator}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground mb-1">Max Supply</p>
										<p className="font-semibold">{asset.maxSupply}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground mb-1">Circulating</p>
										<p className="font-semibold">{asset.circulatingSupply}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground mb-1">Market Rank</p>
										<p className="font-semibold">#{asset.rank}</p>
									</div>
								</>
							) : (
								<>
									<div>
										<p className="text-sm text-muted-foreground mb-1">CEO</p>
										<p className="font-semibold">{asset.ceo}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground mb-1">Founded</p>
										<p className="font-semibold">{asset.founded}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground mb-1">Employees</p>
										<p className="font-semibold">{asset.employees}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground mb-1">Headquarters</p>
										<p className="font-semibold">{asset.headquarters}</p>
									</div>
								</>
							)}
						</div>
					</Card>
				</div>

				{/* Key Stats */}
				<div className="lg:col-span-1">
					<Card variant="elevated" padding="lg">
						<h3 className="text-lg font-semibold mb-4">Key Statistics</h3>
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">Prev Close</span>
								<span className="font-semibold">${formatMoney(asset.prevClose)}</span>
							</div>
							{!isCrypto && (
								<>
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">P/E Ratio</span>
										<span className="font-semibold">{asset.peRatio}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">EPS</span>
										<span className="font-semibold">${asset.eps}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Dividend</span>
										<span className="font-semibold">${asset.dividend}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Yield</span>
										<span className="font-semibold">{asset.dividendYield}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Beta</span>
										<span className="font-semibold">{asset.beta}</span>
									</div>
								</>
							)}
							{isCrypto && (
								<>
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Dominance</span>
										<span className="font-semibold">{asset.dominance}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Avg Volume</span>
										<span className="font-semibold">{formatCompact(asset.avgVolume)}</span>
									</div>
								</>
							)}
							<div className="flex justify-between items-center">
								<span className="text-sm text-muted-foreground">52W Low</span>
								<span className="font-semibold">${formatMoney(asset.week52Low)}</span>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
