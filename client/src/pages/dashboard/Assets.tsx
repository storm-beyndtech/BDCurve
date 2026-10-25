import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Search, Filter, ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { AssetLogo } from "@/components/common/asset-logo";
import { cn } from "@/lib/utils";
import { PriceAreaChart } from "@/components/charts/price-area-chart";
import { useNavigate } from "react-router-dom";
import { HoldingsPanel } from "@/components/portfolio/holdings-panel";
import { fetchPortfolio, type Portfolio } from "@/lib/portfolio";

interface UserAsset {
	symbol: string;
	name: string;
	spot: number;
	funding: number;
	totalQuantity: number;
	currentPrice: number;
	totalValue: number;
	change24h: number;
	type: "stock" | "crypto";
	chartData: Array<{ value: number }>;
}

const generateChartData = (currentPrice: number, changePercent: number) => {
	if (!currentPrice || currentPrice === 0) {
		return Array(30).fill({ value: 0 });
	}
	const startPrice = currentPrice / (1 + changePercent / 100);
	const points = 30;
	const data: { value: number }[] = [];
	for (let i = 0; i < points; i++) {
		const progress = i / (points - 1);
		const value = startPrice + (currentPrice - startPrice) * progress;
		data.push({ value });
	}
	return data;
};

export default function AssetsPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [assets, setAssets] = useState<UserAsset[]>([]);
	const [filteredAssets, setFilteredAssets] = useState<UserAsset[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [hideZeroBalances, setHideZeroBalances] = useState(true);
	const [hideBalances, setHideBalances] = useState(false);

	// Calculate totals
	const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
	const totalPortfolioValue = portfolio?.totalValue ?? 0;
	const totalChange = portfolio?.dayChange ?? 0;
	const totalChangePercent = portfolio?.dayChangePercent ?? 0;

	useEffect(() => {
		if (user?.id) {
			fetchAssets();
			// Refresh every 30 seconds
			const interval = setInterval(fetchAssets, 30000);
			return () => clearInterval(interval);
		}
	}, [user?.id]);

	useEffect(() => {
		filterAssets();
	}, [assets, searchTerm, typeFilter, hideZeroBalances]);

	const fetchAssets = async () => {
		if (!user?.id) return;
		try {
			// Server-side valuation (GET /api/portfolio) is the single source of truth.
			const pf = await fetchPortfolio();
			setPortfolio(pf);
			setAssets(
				pf.holdings.map((h) => ({
					symbol: h.symbol,
					name: h.name,
					spot: h.spot,
					funding: h.funding,
					totalQuantity: h.quantity,
					currentPrice: h.price,
					totalValue: h.value,
					change24h: h.change24h,
					type: h.type === "stock" ? "stock" : "crypto",
					chartData: generateChartData(h.price, h.change24h),
				})),
			);
		} catch (error) {
			console.error("Failed to load portfolio", error);
		} finally {
			setLoading(false);
		}
	};

	const filterAssets = () => {
		let filtered = assets;

		// Hide zero balances
		if (hideZeroBalances) {
			filtered = filtered.filter((a) => a.totalQuantity > 0);
		}

		// Type filter
		if (typeFilter !== "all") {
			filtered = filtered.filter((a) => a.type === typeFilter);
		}

		// Search filter
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(a) =>
					a.symbol.toLowerCase().includes(term) ||
					a.name.toLowerCase().includes(term)
			);
		}

		setFilteredAssets(filtered);
	};

	const handleAssetClick = (asset: UserAsset) => {
		if (asset.type === "crypto") {
			navigate(`/dashboard/crypto/${asset.symbol}`);
		} else {
			navigate(`/dashboard/stocks/${asset.symbol}`);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-500 border-r-transparent"></div>
					<p className="text-sm text-muted-foreground">Loading assets...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">My Assets</h1>
					<p className="text-sm text-muted-foreground mt-1">View and manage your portfolio holdings</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => navigate("/dashboard/deposit")}>
						Deposit
					</Button>
					<Button onClick={() => navigate("/dashboard/trade")}>
						<TrendingUp className="h-4 w-4 mr-2" />
						Trade
					</Button>
				</div>
			</div>

			<HoldingsPanel portfolio={portfolio} loading={loading} onChanged={() => void fetchAssets()} />

			{/* Portfolio Summary */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card variant="glass" padding="lg">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Total Portfolio Value</p>
						<div className="flex items-center gap-2">
							{hideBalances ? (
								<p className="text-3xl font-bold">••••••</p>
							) : (
								<p className="text-3xl font-bold">
									${totalPortfolioValue.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</p>
							)}
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setHideBalances(!hideBalances)}
								className="h-8 w-8 p-0"
							>
								{hideBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</Button>
						</div>
					</div>
				</Card>
				<Card variant="glass" padding="lg">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">24h Change</p>
						<div className="flex items-center gap-2">
							{totalChangePercent >= 0 ? (
								<ArrowUpRight className="h-5 w-5 text-green-600" />
							) : (
								<ArrowDownRight className="h-5 w-5 text-red-600" />
							)}
							{hideBalances ? (
								<p className="text-3xl font-bold">••••••</p>
							) : (
								<>
									<p className={cn("text-3xl font-bold", totalChangePercent >= 0 ? "text-green-600" : "text-red-600")}>
										{totalChangePercent >= 0 ? "+" : ""}
										{totalChangePercent.toFixed(2)}%
									</p>
									<p className={cn("text-sm", totalChangePercent >= 0 ? "text-green-600" : "text-red-600")}>
										(${Math.abs(totalChange).toFixed(2)})
									</p>
								</>
							)}
						</div>
					</div>
				</Card>
				<Card variant="glass" padding="lg">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Total Assets</p>
						<div className="flex items-center gap-3">
							<Wallet className="h-5 w-5 text-muted-foreground" />
							<p className="text-3xl font-bold">{filteredAssets.length}</p>
							<p className="text-sm text-muted-foreground">holdings</p>
						</div>
					</div>
				</Card>
			</div>

			{/* Filters */}
			<Card variant="glass" padding="lg">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Search */}
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by symbol or name..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* Type Filter */}
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-muted-foreground" />
						<select
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
							className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
						>
							<option value="all">All Types</option>
							<option value="crypto">Crypto</option>
							<option value="stock">Stocks</option>
						</select>
					</div>

					{/* Hide Zero Balances */}
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="hideZero"
							checked={hideZeroBalances}
							onChange={(e) => setHideZeroBalances(e.target.checked)}
							className="rounded"
						/>
						<label htmlFor="hideZero" className="text-sm text-muted-foreground cursor-pointer">
							Hide zero balances
						</label>
					</div>
				</div>
			</Card>

			{/* Assets List */}
			<Card variant="glass" padding="lg" hover="lift">
				<CardHeader className="p-0 space-y-2">
					<CardTitle className="text-lg">Holdings</CardTitle>
					<CardDescription>
						{filteredAssets.length} {filteredAssets.length === 1 ? "asset" : "assets"}
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0 mt-6">
					{filteredAssets.length === 0 ? (
						<div className="text-center py-12 text-sm text-muted-foreground">
							{hideZeroBalances ? "No assets with balance found" : "No assets found"}
						</div>
					) : (
						<div className="space-y-3">
							{filteredAssets.map((asset) => {
								const isPositive = asset.change24h >= 0;
								return (
									<div
										key={asset.symbol}
										onClick={() => handleAssetClick(asset)}
										className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors cursor-pointer"
									>
										{/* Asset Logo & Info */}
										<div className="flex items-center gap-3 flex-1 min-w-0">
											<AssetLogo symbol={asset.symbol} name={asset.name} type={asset.type} size={40} />
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<p className="font-semibold">{asset.symbol}</p>
													<Badge variant={asset.type === "crypto" ? "accent" : "default"} className="text-xs">
														{asset.type}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground truncate">{asset.name}</p>
											</div>
										</div>

										{/* Holdings */}
										<div className="hidden sm:block text-right">
											<p className="text-sm text-muted-foreground">Holdings</p>
											{hideBalances ? (
												<p className="font-semibold">••••••</p>
											) : (
												<>
													<p className="font-semibold">{asset.totalQuantity.toLocaleString()} {asset.symbol}</p>
													{asset.funding > 0 && (
														<p className="text-xs text-muted-foreground">
															Spot: {asset.spot.toLocaleString()} | Funding: {asset.funding.toLocaleString()}
														</p>
													)}
												</>
											)}
										</div>

										{/* Price */}
										<div className="hidden md:block text-right">
											<p className="text-sm text-muted-foreground">Price</p>
											<p className="font-semibold">
												${asset.currentPrice.toLocaleString("en-US", {
													minimumFractionDigits: 2,
													maximumFractionDigits: asset.currentPrice < 1 ? 4 : 2,
												})}
											</p>
										</div>

										{/* 24h Change */}
										<div className="hidden lg:block text-right">
											<p className="text-sm text-muted-foreground">24h Change</p>
											<p className={cn("font-semibold", isPositive ? "text-green-600" : "text-red-600")}>
												{isPositive ? "+" : ""}
												{asset.change24h.toFixed(2)}%
											</p>
										</div>

										{/* Chart */}
										<div className="hidden xl:block w-32 h-12">
											<PriceAreaChart
												symbol={asset.symbol}
												data={asset.chartData}
												isPositive={isPositive}
												variant="compact"
												height="100%"
												showGrid={false}
											/>
										</div>

										{/* Total Value */}
										<div className="text-right">
											<p className="text-sm text-muted-foreground">Value</p>
											{hideBalances ? (
												<p className="text-lg font-bold">••••••</p>
											) : (
												<p className="text-lg font-bold">
													${asset.totalValue.toLocaleString("en-US", {
														minimumFractionDigits: 2,
														maximumFractionDigits: 2,
													})}
												</p>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
