import { useState, useEffect, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Plus, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";
import { AssetLogo } from "@/components/common/asset-logo";
import { PriceAreaChart } from "@/components/charts/price-area-chart";
import { buildFallbackSeries } from "@/lib/series";
import { useLiveQuote } from "@/hooks/useLiveQuote";

interface WatchlistItem {
	symbol: string;
	name: string;
	currentPrice: number;
	changePercent: number;
	type: "stock" | "crypto";
	chartData: { value: number }[];
}

const toNumber = (val: any, fallback = 0) => {
	const n = Number(val);
	return Number.isFinite(n) ? n : fallback;
};

function WatchlistRow({
	item,
	onNavigate,
	onRemove,
}: {
	item: WatchlistItem;
	onNavigate: (path: string) => void;
	onRemove: (symbol: string, e: MouseEvent) => void;
}) {
	const isCrypto = item.type === "crypto";
	const live = useLiveQuote(item.symbol, isCrypto ? "crypto" : "stock", false);
	const currentPrice = live.quote?.price ?? item.currentPrice;
	const changePercent = live.quote?.changePercent ?? item.changePercent;
	const hasPrice = currentPrice > 0;
	// Always use historical data for mini charts - only update price/change in real-time
	const chartSeries = item.chartData;
	const isPositive = changePercent >= 0;

	return (
		<Card
			key={item.symbol}
			variant="elevated"
			padding="none"
			className="overflow-hidden cursor-pointer hover:shadow-depth-lg transition-all group"
			onClick={() =>
				onNavigate(
					isCrypto ? `/dashboard/crypto/${item.symbol}` : `/dashboard/stocks/${item.symbol}`
				)
			}
		>
			<div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
				{/* Logo & Info */}
				<div className="flex items-center gap-3 flex-1 min-w-[180px]">
					<AssetLogo
						symbol={item.symbol}
						name={item.name}
						type={isCrypto ? "crypto" : "stock"}
						size={44}
					/>
					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<div className="font-bold text-base">{item.symbol}</div>
							{hasPrice ? (
								<Badge variant={isPositive ? "default" : "destructive"} className="gap-1">
									{isPositive ? (
										<TrendingUp className="h-3 w-3" />
									) : (
										<TrendingDown className="h-3 w-3" />
									)}
									<span>
										{isPositive ? "+" : ""}
										{changePercent.toFixed(2)}%
									</span>
								</Badge>
							) : (
								<Badge variant="outline">N/A</Badge>
							)}
						</div>
						<div className="text-sm text-muted-foreground truncate">{item.name}</div>
					</div>
				</div>

				{/* Chart on the left of price/action cluster */}
				<div className="w-full md:w-36 h-16 flex-shrink-0">
					<PriceAreaChart
						symbol={item.symbol}
						data={chartSeries}
						isPositive={isPositive}
						variant="compact"
						height="100%"
						showGrid={false}
					/>
				</div>

				{/* Price & Change */}
				<div className="text-right min-w-[140px]">
					<div className="text-lg font-bold leading-tight">
						{hasPrice
							? `$${currentPrice.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: currentPrice < 1 ? 4 : 2,
							  })}`
							: "—"}
					</div>
					{hasPrice && (
						<div
							className={cn(
								"text-sm font-medium",
								isPositive ? "text-green-600" : "text-red-600"
							)}
						>
							{isPositive ? "+" : ""}
							{changePercent.toFixed(2)}%
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
					<Button
						variant="outline"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={(e) => onRemove(item.symbol, e)}
					>
						<X className="h-3 w-3" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							onNavigate(
								`/dashboard/trade?symbol=${item.symbol}&type=${isCrypto ? "crypto" : "stock"}`
							);
						}}
					>
						Trade
					</Button>
				</div>
			</div>
		</Card>
	);
}

export default function WatchlistPage() {
	const navigate = useNavigate();
	const [items, setItems] = useState<WatchlistItem[]>(() => {
		try {
			const stored = localStorage.getItem("watchlist-items");
			if (stored) {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed)) return parsed;
			}
		} catch {}
		return [];
	});
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		fetchWatchlistData();
		// Refresh every 30 seconds
		const interval = setInterval(fetchWatchlistData, 30000);
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
			seed: `watch-${symbol}-${type}`,
		});
	};

	const fetchWatchlistData = async () => {
		try {
			console.log("[WATCHLIST] ========== Fetching watchlist data ==========");

			// Fetch both stocks and crypto in parallel
			const [stocksData, cryptoData] = await Promise.all([
				apiGet<any>("/api/market/stocks").catch(() => []),
				apiGet<any>("/api/coins").catch(() => []),
			]);

			const stockList = Array.isArray(stocksData) ? stocksData : stocksData?.stocks || [];
			const cryptoList = Array.isArray(cryptoData) ? cryptoData : cryptoData?.coins || [];

			console.log(`[WATCHLIST] Fetched ${stockList.length} stocks, ${cryptoList.length} cryptos`);

			// Get top stocks and crypto
			const topStocksData = stockList.slice(0, 5);
			const topCryptoData = cryptoList
				.filter((c: any) => c.symbol !== "USDT" && c.symbol !== "USD")
				.slice(0, 3);

			const topStocks = topStocksData.map((stock: any) => {
				const currentPrice = toNumber(stock.currentPrice, 0);
				const changePercent = toNumber(stock.changePercent, 0);
				const chartData = generateFallbackChartData(currentPrice, changePercent, stock.symbol, "stock");

				return {
					symbol: stock.symbol,
					name: stock.companyName || stock.name || stock.symbol,
					currentPrice,
					changePercent,
					type: "stock" as const,
					chartData,
				};
			});

			const topCrypto = topCryptoData.map((coin: any) => {
				const currentPrice = toNumber(coin.price, 0);
				const changePercent = toNumber(coin.change24h, 0);
				const chartData = generateFallbackChartData(currentPrice, changePercent, coin.symbol, "crypto");

				return {
					symbol: coin.symbol,
					name: coin.name || coin.symbol,
					currentPrice,
					changePercent,
					type: "crypto" as const,
					chartData,
				};
			});

			console.log(`[WATCHLIST] ========== Loaded ${topStocks.length + topCrypto.length} watchlist items ==========\n`);
			const next = [...topStocks, ...topCrypto];
			setItems(next);
			try {
				localStorage.setItem("watchlist-items", JSON.stringify(next));
			} catch {}
		} catch (error) {
			console.error("Failed to fetch watchlist data:", error);
			toast.error("Failed to load watchlist");
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveFromWatchlist = (symbol: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const next = items.filter((item) => item.symbol !== symbol);
		setItems(next);
		try {
			localStorage.setItem("watchlist-items", JSON.stringify(next));
		} catch {}
		toast.success(`Removed ${symbol} from watchlist`);
	};

	const filteredItems = items.filter(
		(item) =>
			item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin mx-auto text-accent-500" />
					<p className="text-sm text-muted-foreground">Loading watchlist...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">Watchlist</h1>
					<p className="text-sm text-muted-foreground">
						Track your favorite stocks and crypto
					</p>
				</div>
				<Button variant="outline" className="gap-2 border" onClick={() => navigate("/dashboard/markets")}>
					<Plus className="h-4 w-4" />
					Add to Watchlist
				</Button>
			</div>

			{/* Search Bar */}
			<Card variant="elevated" padding="md">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search your watchlist..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
			</Card>

			{/* Watchlist Items */}
			<div className="space-y-3">
				{filteredItems.map((item) => (
					<WatchlistRow
						key={item.symbol}
						item={item}
						onNavigate={(path) => navigate(path)}
						onRemove={handleRemoveFromWatchlist}
					/>
				))}
			</div>

			{/* Empty State */}
			{filteredItems.length === 0 && (
				<Card variant="elevated" padding="xl">
					<div className="text-center space-y-4">
						<p className="text-muted-foreground">
							{searchQuery
								? `No items found matching "${searchQuery}"`
								: "Your watchlist is empty"}
						</p>
						<Button
							variant="outline"
							className="border"
							onClick={() =>
								searchQuery ? setSearchQuery("") : navigate("/dashboard/markets")
							}
						>
							{searchQuery ? "Clear Search" : "Add Items"}
						</Button>
					</div>
				</Card>
			)}
		</div>
	);
}
