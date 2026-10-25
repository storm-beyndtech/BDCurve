import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Search, Filter, ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiGet } from "@/lib/api";
import { AssetLogo } from "@/components/common/asset-logo";
import { cn } from "@/lib/utils";
import { PriceAreaChart } from "@/components/charts/price-area-chart";
import { useNavigate } from "react-router-dom";

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

const toNumber = (val: any, fallback = 0) => {
	const n = Number(val);
	// Protect against NaN, Infinity, and unrealistic values
	if (!Number.isFinite(n)) return fallback;
	// Prevent unrealistic prices/quantities (e.g., > $10M)
	if (Math.abs(n) > 10_000_000) return fallback;
	return n;
};

const isUsdPeggedAsset = (symbol: string) => ["USDT", "USDC", "USD"].includes(symbol?.toUpperCase());

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
	const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);
	const totalChange = assets.reduce((sum, asset) => {
		const previousValue = asset.totalValue / (1 + asset.change24h / 100);
		return sum + (asset.totalValue - previousValue);
	}, 0);
	const totalChangePercent = totalPortfolioValue > 0 ? (totalChange / (totalPortfolioValue - totalChange)) * 100 : 0;

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
			const [userData, stocks, cryptos] = await Promise.all([
				apiGet<any>(`/api/auth/users/${user.id}`).catch(() => null),
				apiGet<any>("/api/market/stocks").catch(() => []),
				apiGet<any>("/api/coins").catch(() => []),
			]);

			// API returns { user: {...} }
			const userAssets = userData?.user?.assets || userData?.assets || [];
			const stockList = Array.isArray(stocks) ? stocks : stocks?.stocks || [];
			const cryptoList = Array.isArray(cryptos) ? cryptos : cryptos?.coins || [];

			// IMPORTANT: Validate that we have real price data before calculating
			// Backend returns price: 0 when cache is loading, which causes incorrect calculations
			const hasValidStockPrices = stockList.length === 0 || stockList.some((s: any) => s.currentPrice > 0);
			const hasValidCryptoPrices = cryptoList.length === 0 || cryptoList.some((c: any) => c.price > 0);

			// If prices are still loading (all zeros), skip update and keep showing 0
			if (!hasValidStockPrices || !hasValidCryptoPrices) {
				console.warn("Market data still loading (no valid prices detected), skipping update");
				setLoading(false);
				return;
			}

			const processedAssets: UserAsset[] = [];

			// Maximum realistic values for validation
			const MAX_QUANTITY = 1_000_000; // Max quantity per asset (1 million units)
			const MAX_ASSET_VALUE = 10_000_000; // Max value per asset ($10M)

			for (const asset of userAssets) {
				const spot = toNumber(asset.spot, 0);
				const funding = toNumber(asset.funding, 0);
				const totalQuantity = spot + funding;

				// Validate quantity is realistic
				if (totalQuantity > MAX_QUANTITY) {
					console.error(`[${asset.symbol}] INVALID QUANTITY: ${totalQuantity} exceeds ${MAX_QUANTITY}. Skipping.`);
					continue;
				}

				// Skip if zero balance and hideZeroBalances is true
				if (totalQuantity <= 0) {
					// Still include it with zero value
					processedAssets.push({
						symbol: asset.symbol,
						name: asset.name || asset.symbol,
						spot,
						funding,
						totalQuantity,
						currentPrice: 0,
						totalValue: 0,
						change24h: 0,
						type: "crypto",
						chartData: generateChartData(0, 0),
					});
					continue;
				}

				let currentPrice = 0;
				let change24h = 0;
				let name = asset.name || asset.symbol;
				let type: "stock" | "crypto" = "crypto";

				if (isUsdPeggedAsset(asset.symbol)) {
					currentPrice = 1;
					change24h = 0;
				} else {
					// Check if it's a stock
					const stock = stockList.find((s: any) => s.symbol === asset.symbol);
					if (stock) {
						currentPrice = toNumber(stock.currentPrice, 0);
						change24h = toNumber(stock.changePercent, 0);
						name = stock.companyName || stock.name || name;
						type = "stock";
					} else {
						// Check if it's a crypto
						const coin = cryptoList.find((c: any) => c.symbol === asset.symbol);
						if (coin) {
							currentPrice = toNumber(coin.price, 0);
							change24h = toNumber(coin.change24h, 0);
							name = coin.name || name;
							type = "crypto";
						}
					}
				}

				// Skip asset if no valid price found (prevents showing incorrect valuations)
				if (!currentPrice || currentPrice <= 0) {
					console.warn(`[${asset.symbol}] No valid price found. Skipping asset valuation.`);
					processedAssets.push({
						symbol: asset.symbol,
						name,
						spot,
						funding,
						totalQuantity,
						currentPrice: 0,
						totalValue: 0,
						change24h: 0,
						type,
						chartData: generateChartData(0, 0),
					});
					continue;
				}

				const totalValue = totalQuantity * currentPrice;

				// Validate asset value is realistic
				if (totalValue > MAX_ASSET_VALUE) {
					console.error(
						`[${asset.symbol}] INVALID ASSET VALUE: ${totalQuantity} × ${currentPrice} = $${totalValue.toFixed(2)} exceeds $${MAX_ASSET_VALUE}. Capping to zero.`
					);
					processedAssets.push({
						symbol: asset.symbol,
						name,
						spot,
						funding,
						totalQuantity,
						currentPrice,
						totalValue: 0,
						change24h: 0,
						type,
						chartData: generateChartData(0, 0),
					});
					continue;
				}

				const history = isUsdPeggedAsset(asset.symbol) ? [{ value: 1 }] : [];
				processedAssets.push({
					symbol: asset.symbol,
					name,
					spot,
					funding,
					totalQuantity,
					currentPrice,
					totalValue,
					change24h,
					type,
					chartData: history.length ? history : generateChartData(currentPrice, change24h),
				});
			}

			// Sort by total value descending
			processedAssets.sort((a, b) => b.totalValue - a.totalValue);
			setAssets(processedAssets);
		} catch (error) {
			console.error("Failed to fetch assets:", error);
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
