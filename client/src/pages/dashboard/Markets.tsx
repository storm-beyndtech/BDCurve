import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Search, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";
import { AssetLogo } from "@/components/common/asset-logo";
import { PriceAreaChart } from "@/components/charts/price-area-chart";
import { buildFallbackSeries } from "@/lib/series";
import { useLiveQuote } from "@/hooks/useLiveQuote";

const toNumber = (val: any, fallback = 0) => {
	const n = Number(val);
	return Number.isFinite(n) ? n : fallback;
};

interface MarketAsset {
	symbol: string;
	name: string;
	currentPrice: number;
	changePercent: number;
	volume?: number;
	marketCap?: number;
	chartData: { value: number }[];
	type: "stock" | "crypto";
}

function MarketRow({ asset, onNavigate, formatCompact }: { asset: MarketAsset; onNavigate: (path: string) => void; formatCompact: (value?: number) => string }) {
	const isCrypto = asset.type === "crypto";
	const live = useLiveQuote(asset.symbol, isCrypto ? "crypto" : "stock", false);
	const currentPrice = live.quote?.price ?? asset.currentPrice;
	const changePercent = live.quote?.changePercent ?? asset.changePercent;
	const hasPrice = currentPrice > 0;
	const isPositive = changePercent >= 0;
	// Always use historical data for sparklines - only update price/change in real-time
	const chartData = asset.chartData;

	return (
		<div className="p-4 hover:bg-muted/50 transition-colors group">
			<div className="flex items-center gap-4">
				{/* Asset Info with Logo */}
				<div
					className="flex-1 min-w-0 cursor-pointer"
					onClick={() =>
						onNavigate(isCrypto ? `/dashboard/crypto/${asset.symbol}` : `/dashboard/stocks/${asset.symbol}`)
					}
				>
					<div className="flex items-center gap-3 mb-1">
						<AssetLogo
							symbol={asset.symbol}
							name={asset.name}
							type={isCrypto ? "crypto" : "stock"}
							size={36}
						/>
						<span className="font-bold text-lg">{asset.symbol}</span>
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
					<p className="text-sm text-muted-foreground truncate">{asset.name}</p>
					<div className="flex items-center gap-4 mt-1">
						<span className="text-xs text-muted-foreground">Vol: {formatCompact(asset.volume)}</span>
						<span className="text-xs text-muted-foreground">MCap: {formatCompact(asset.marketCap)}</span>
					</div>
				</div>

				{/* Sparkline */}
				<div className="hidden sm:block w-28 h-12">
					<PriceAreaChart
						symbol={asset.symbol}
						data={chartData}
						isPositive={isPositive}
						variant="compact"
						height="100%"
						showGrid={false}
					/>
				</div>

				{/* Price */}
				<div className="text-right min-w-[100px]">
					<p className="font-bold text-lg">
						{hasPrice
							? `$${currentPrice.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: currentPrice < 1 ? 4 : 2,
							  })}`
							: "—"}
					</p>
				</div>

				{/* Actions */}
				<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						variant="outline"
						size="sm"
						className="gap-1"
						onClick={(e) => {
							e.stopPropagation();
							// TODO: Implement add to watchlist
						}}
					>
						<Eye className="h-3 w-3" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							onNavigate(`/dashboard/trade?symbol=${asset.symbol}&type=${isCrypto ? "crypto" : "stock"}`)
						}
					>
						Trade
					</Button>
				</div>
			</div>
		</div>
	);
}

export default function MarketsPage() {
	const navigate = useNavigate();
	const [assets, setAssets] = useState<MarketAsset[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"marketCap" | "change" | "volume">("change");

	useEffect(() => {
		fetchMarketData();
		// Refresh every 30 seconds
		const interval = setInterval(fetchMarketData, 30000);
		return () => clearInterval(interval);
	}, []);

	const generateFallbackChartData = (currentPrice: number, changePercent: number, symbol: string, type: "stock" | "crypto") => {
		if (!currentPrice || currentPrice <= 0) {
			return Array.from({ length: 40 }, () => ({ value: 0 }));
		}
		return buildFallbackSeries(currentPrice, changePercent, 70, {
			minBand: type === "crypto" ? 0.14 : 0.1,
			spikeChance: 0.12,
			spikeIntensity: 3,
			seed: `${symbol}-${type}`,
		});
	};

	const fetchMarketData = async () => {
		try {
			console.log("[MARKETS] ========== Fetching market data ==========");

			// Fetch both stocks and crypto in parallel
			const [stocksData, cryptoData] = await Promise.all([
				apiGet<any>("/api/market/stocks").catch(() => []),
				apiGet<any>("/api/coins").catch(() => []),
			]);

			const stockList = Array.isArray(stocksData) ? stocksData : stocksData?.stocks || [];
			const cryptoList = Array.isArray(cryptoData) ? cryptoData : cryptoData?.coins || [];
			const filteredCryptoList = cryptoList.filter((coin: any) => coin.symbol !== "USDT" && coin.symbol !== "USD");

			console.log(`[MARKETS] Fetched ${stockList.length} stocks, ${filteredCryptoList.length} cryptos`);

			// Overview cards use live quotes without spending one history request per asset.
			const stockAssets: MarketAsset[] = stockList.map((stock: any) => {
				const currentPrice = toNumber(stock.currentPrice, 0);
				const changePercent = toNumber(stock.changePercent, 0);
				const chartData = generateFallbackChartData(currentPrice, changePercent, stock.symbol, "stock");

				return {
					symbol: stock.symbol,
					name: stock.companyName || stock.name || stock.symbol,
					currentPrice,
					changePercent,
					volume: toNumber(stock.volume, 0),
					marketCap: toNumber(stock.marketCap, 0),
					chartData,
					type: "stock" as const,
				};
			});

			const cryptoAssets: MarketAsset[] = filteredCryptoList.map((coin: any) => {
				const currentPrice = toNumber(coin.price, 0);
				const changePercent = toNumber(coin.change24h, 0);
				const chartData = generateFallbackChartData(currentPrice, changePercent, coin.symbol, "crypto");

				return {
					symbol: coin.symbol,
					name: coin.name || coin.symbol,
					currentPrice,
					changePercent,
					volume: toNumber(coin.volume24h, 0),
					marketCap: toNumber(coin.marketCap, 0),
					chartData,
					type: "crypto" as const,
				};
			});

			console.log(`[MARKETS] ========== Loaded ${stockAssets.length + cryptoAssets.length} assets ==========\n`);
			setAssets([...stockAssets, ...cryptoAssets]);
		} catch (error) {
			console.error("Failed to fetch market data:", error);
			toast.error("Failed to load market data");
		} finally {
			setLoading(false);
		}
	};

	const filteredAndSortedAssets = assets
		.filter(
			(asset) =>
				asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
				asset.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
		.sort((a, b) => {
			if (sortBy === "change") {
				return b.changePercent - a.changePercent;
			}
			if (sortBy === "volume") {
				return (b.volume || 0) - (a.volume || 0);
			}
			return (b.marketCap || 0) - (a.marketCap || 0);
		});

	const formatCompact = (value?: number) => {
		if (!value) return "N/A";
		return value.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 2 });
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin mx-auto text-accent-500" />
					<p className="text-sm text-muted-foreground">Loading markets...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-semibold tracking-tight">Markets</h1>
				<p className="text-sm text-muted-foreground">
					Explore and discover stocks, ETFs, and crypto
				</p>
			</div>

			{/* Search & Filters */}
			<div className="flex flex-col md:flex-row gap-4">
				<div className="flex-1">
					<Card variant="elevated" padding="md">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search stocks and crypto..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
					</Card>
				</div>
				<Card variant="elevated" padding="md">
					<select
						className="bg-transparent border-none outline-none cursor-pointer"
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as any)}
					>
						<option value="change">Top Movers</option>
						<option value="marketCap">Market Cap</option>
						<option value="volume">Volume</option>
					</select>
				</Card>
			</div>

			{/* Market Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<Card variant="elevated" padding="md">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground mb-1">S&P 500</p>
							<p className="text-2xl font-bold">5,026.61</p>
						</div>
						<Badge variant="default" className="gap-1">
							<TrendingUp className="h-3 w-3" />
							+0.85%
						</Badge>
					</div>
				</Card>
				<Card variant="elevated" padding="md">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground mb-1">NASDAQ</p>
							<p className="text-2xl font-bold">15,481.92</p>
						</div>
						<Badge variant="default" className="gap-1">
							<TrendingUp className="h-3 w-3" />
							+1.24%
						</Badge>
					</div>
				</Card>
				<Card variant="elevated" padding="md">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground mb-1">DOW</p>
							<p className="text-2xl font-bold">38,996.39</p>
						</div>
						<Badge variant="destructive" className="gap-1">
							<TrendingDown className="h-3 w-3" />
							-0.12%
						</Badge>
					</div>
				</Card>
			</div>

			{/* Assets List */}
			<Card variant="elevated" padding="none">
				<div className="p-6 border-b border-border">
					<h3 className="text-lg font-semibold">All Markets</h3>
					<p className="text-sm text-muted-foreground">
						{filteredAndSortedAssets.length} results
					</p>
				</div>
				<div className="divide-y divide-border">
					{filteredAndSortedAssets.map((asset) => (
						<MarketRow
							key={asset.symbol}
							asset={asset}
							formatCompact={formatCompact}
							onNavigate={(path) => navigate(path)}
						/>
					))}
				</div>
			</Card>

			{/* Empty State */}
			{filteredAndSortedAssets.length === 0 && (
				<Card variant="elevated" padding="xl">
					<div className="text-center space-y-4">
						<p className="text-muted-foreground">
							No markets found matching "{searchQuery}"
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
