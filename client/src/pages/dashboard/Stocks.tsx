import { useState, useEffect, useMemo, memo, useCallback } from "react";
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
import { Sparkline } from "@/components/marketing/visuals/market-panel";

interface Stock {
	symbol: string;
	name: string;
	currentPrice: number;
	changePercent: number;
	volume?: number;
	marketCap?: number;
	sparkline: number[];
}

const StockCard = memo(function StockCard({
	stock,
	onNavigate,
	formatCompact,
}: {
	stock: Stock;
	onNavigate: (path: string) => void;
	formatCompact: (v?: number) => string;
}) {
	const currentPrice = stock.currentPrice;
	const changePercent = stock.changePercent;
	const hasPrice = currentPrice > 0;
	const isPositive = changePercent >= 0;

	return (
		<Card
			key={stock.symbol}
			variant="elevated"
			padding="none"
			className="overflow-hidden cursor-pointer hover:shadow-depth-lg transition-all group"
			onClick={() => onNavigate(`/dashboard/stocks/${stock.symbol}`)}
		>
			{/* Header with Logo */}
			<div className="p-4 pb-3">
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center gap-3">
						<AssetLogo symbol={stock.symbol} name={stock.name} size={40} />
						<div>
							<h3 className="font-bold text-lg">{stock.symbol}</h3>
							<p className="text-xs text-muted-foreground truncate max-w-[120px]">
								{stock.name}
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
				<Sparkline values={stock.sparkline} positive={isPositive} className="px-1" />
			</div>

			{/* Footer */}
			<div className="p-4 pt-3 border-t border-border/50">
				<div className="flex items-end justify-between gap-2">
					<div>
						<p className="text-2xl font-bold">
							{hasPrice
								? `$${currentPrice.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
								  })}`
								: "—"}
						</p>
						{hasPrice && (
							<p className={cn("text-sm font-medium", isPositive ? "text-green-600" : "text-red-600")}>
								{isPositive ? "+" : ""}${Math.abs((currentPrice * changePercent) / 100).toFixed(2)}
							</p>
						)}
					</div>
					<div className="text-right text-xs text-muted-foreground leading-tight">
						<p>Vol: {formatCompact(stock.volume)}</p>
						<p>MCap: {formatCompact(stock.marketCap)}</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={(e) => {
							e.stopPropagation();
							onNavigate(`/dashboard/trade?symbol=${stock.symbol}&type=stock`);
						}}
					>
						Trade
					</Button>
				</div>
			</div>
		</Card>
	);
});

export default function StocksPage() {
	const navigate = useNavigate();
	const [stocks, setStocks] = useState<Stock[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"marketCap" | "change" | "volume">("change");

	useEffect(() => {
		fetchStocks();
		// Server caches quotes ~90s; refresh every 60s (skip while tab hidden)
		const interval = setInterval(() => { if (!document.hidden) fetchStocks(); }, 60000);
		return () => clearInterval(interval);
	}, []);

	const fetchStocks = async () => {
		try {
			const data = await apiGet<any>("/api/market/stocks");
			const stockList = Array.isArray(data) ? data : data?.stocks || [];

			const stocksWithCharts = stockList.map((stock: any) => ({
					symbol: stock.symbol,
					name: stock.companyName || stock.name || stock.symbol,
					currentPrice: stock.currentPrice || stock.price || 0,
					changePercent: stock.changePercent ?? 0,
					volume: stock.volume,
					marketCap: stock.marketCap,
					sparkline: Array.isArray(stock.sparkline) ? stock.sparkline : [],
				}));

			setStocks(stocksWithCharts);
		} catch (error) {
			console.error("Failed to fetch stocks:", error);
			toast.error("Failed to load stocks");
		} finally {
			setLoading(false);
		}
	};

	const formatCompact = useCallback((value?: number) => {
		if (!value) return "N/A";
		return value.toLocaleString("en-US", {
			notation: "compact",
			maximumFractionDigits: 2,
		});
	}, []);

	const filteredAndSortedStocks = useMemo(() => stocks
		.filter(
			(stock) =>
				stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
				stock.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
		.sort((a, b) => {
			if (sortBy === "change") {
				return b.changePercent - a.changePercent;
			}
			if (sortBy === "volume") {
				return (b.volume || 0) - (a.volume || 0);
			}
			return (b.marketCap || 0) - (a.marketCap || 0);
		}), [stocks, searchQuery, sortBy]);
	const handleNavigate = useCallback((path: string) => navigate(path), [navigate]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin mx-auto text-accent-500" />
					<p className="text-sm text-muted-foreground">Loading stocks...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 max-w-[1400px] mx-auto">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Stocks</h1>
					<p className="text-sm text-muted-foreground">
						Trade stocks with zero commissions
					</p>
				</div>
				<div className="flex gap-2">
					<select
						className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as any)}
					>
						<option value="change">Top Movers</option>
						<option value="marketCap">Market Cap</option>
						<option value="volume">Volume</option>
					</select>
				</div>
			</div>

			{/* Search */}
			<Card variant="elevated" padding="md">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search stocks..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
			</Card>

			{/* Stocks Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{filteredAndSortedStocks.map((stock) => (
					<StockCard
						key={stock.symbol}
						stock={stock}
						formatCompact={formatCompact}
						onNavigate={handleNavigate}
					/>
				))}
			</div>

			{/* Empty State */}
			{filteredAndSortedStocks.length === 0 && (
				<Card variant="elevated" padding="xl">
					<div className="text-center space-y-4">
						<p className="text-muted-foreground">
							No stocks found matching "{searchQuery}"
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
