import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
	PortfolioSummary,
	AssetList,
	RecentActivity,
	QuickActions,
	type PortfolioMetrics,
	type Asset,
	type ActivityItem as RecentActivityItem,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	TrendingUp,
	Settings,
	Loader2,
	Users,
	ChevronLeft,
	ChevronRight,
	Check,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiGet, apiPost } from "@/lib/api";
import { AssetLogo } from "@/components/common/asset-logo";
import { cn } from "@/lib/utils";
import { PriceAreaChart } from "@/components/charts/price-area-chart";
import { toast } from "sonner";
import { fetchAssetHistorical } from "@/lib/historical";

const toNumber = (val: any, fallback = 0) => {
	const n = Number(val);
	// Protect against NaN, Infinity, and unrealistic values
	if (!Number.isFinite(n)) return fallback;
	// Prevent unrealistic prices (e.g., > $10M for crypto/stocks)
	if (Math.abs(n) > 10_000_000) return fallback;
	return n;
};

const isUsdPeggedAsset = (symbol: string) => ["USDT", "USDC", "USD"].includes(symbol?.toUpperCase());

const buildPortfolio = (userAssets: any[], stocks: any, cryptos: any) => {
	console.log("=== BUILDING PORTFOLIO ===");
	console.log("User assets count:", userAssets?.length || 0);
	console.log("User assets:", JSON.stringify(userAssets, null, 2));

	let totalValue = 0;
	const assetList: Asset[] = [];

	// Maximum realistic values for validation
	const MAX_QUANTITY = 1_000_000; // Max quantity per asset (1 million units)
	const MAX_ASSET_VALUE = 10_000_000; // Max value per asset ($10M)
	const MAX_PORTFOLIO_VALUE = 100_000_000; // Max total portfolio ($100M)

	for (const asset of userAssets) {
		const rawQuantity = (asset.spot || 0) + (asset.funding || 0);

		// Validate quantity is realistic
		const quantity = toNumber(rawQuantity, 0);
		if (quantity <= 0) {
			console.log(`[${asset.symbol}] Skipped - quantity is 0`);
			continue;
		}

		if (quantity > MAX_QUANTITY) {
			console.error(`[${asset.symbol}] INVALID QUANTITY DETECTED: ${quantity} exceeds ${MAX_QUANTITY}. Skipping asset.`);
			continue;
		}

		console.log(
			`[${asset.symbol}] spot: ${asset.spot}, funding: ${asset.funding || 0}, quantity: ${quantity}`,
		);

		let currentPrice = 0;
		let changePercent = 0;
		let name = asset.name || asset.symbol;

		if (isUsdPeggedAsset(asset.symbol)) {
			currentPrice = 1;
			changePercent = 0;
		} else {
			const stockList = Array.isArray(stocks) ? stocks : stocks?.stocks || [];
			const stock = stockList.find((s: any) => s.symbol === asset.symbol);
			if (stock) {
				currentPrice = toNumber(stock.currentPrice, 0);
				changePercent = toNumber(stock.changePercent, 0);
				name = stock.companyName || name;
			} else {
				const cryptoList = Array.isArray(cryptos) ? cryptos : cryptos?.coins || [];
				const coin = cryptoList.find((c: any) => c.symbol === asset.symbol);
				if (coin) {
					currentPrice = toNumber(coin.price, 0);
					changePercent = toNumber(coin.change24h, 0);
					name = coin.name || name;
				}
			}
		}

		if (!currentPrice || currentPrice <= 0) {
			console.warn(`[${asset.symbol}] No live price available, skipping valuation.`);
			currentPrice = 0;
			changePercent = 0;
		}

		const rawAssetValue = quantity * currentPrice;

		// Validate asset value is realistic
		if (rawAssetValue > MAX_ASSET_VALUE) {
			console.error(
				`[${asset.symbol}] INVALID ASSET VALUE: ${quantity} × ${currentPrice} = $${rawAssetValue.toFixed(2)} exceeds $${MAX_ASSET_VALUE}. Skipping asset.`
			);
			continue;
		}

		const assetValue = rawAssetValue;
		console.log(
			`[${asset.symbol}] Final calculation: ${quantity} × ${currentPrice} = $${assetValue.toFixed(2)}`,
		);

		// Validate total portfolio value doesn't exceed realistic limit
		if (totalValue + assetValue > MAX_PORTFOLIO_VALUE) {
			console.error(
				`[${asset.symbol}] Adding this asset would exceed max portfolio value of $${MAX_PORTFOLIO_VALUE}. Current: $${totalValue.toFixed(2)}, Asset: $${assetValue.toFixed(2)}. Skipping.`
			);
			continue;
		}

		totalValue += assetValue;

		assetList.push({
			symbol: asset.symbol,
			name,
			quantity,
			currentPrice,
			totalValue: assetValue,
			changePercent,
			chartData: generateChartData(currentPrice, changePercent),
		});
	}

	console.log("=== PORTFOLIO TOTAL ===");
	console.log(`Total Portfolio Value: $${totalValue.toFixed(2)}`);
	console.log(`Assets in portfolio: ${assetList.length}`);
	console.log("Asset list:", assetList.map((a) => `${a.symbol}: $${a.totalValue.toFixed(2)}`).join(", "));

	return { totalValue, assetList };
};

const generateChartData = (currentPrice: number, changePercent: number) => {
	if (!currentPrice || currentPrice === 0) {
		return Array(10).fill({ value: 0 });
	}
	const startPrice = currentPrice / (1 + changePercent / 100);
	const points = 50;
	const data: { value: number }[] = [];
	for (let i = 0; i < points; i++) {
		const progress = i / (points - 1);
		const value = startPrice + (currentPrice - startPrice) * progress;
		data.push({ value });
	}
	return data;
};

type ProfitSummaryState = {
	total: number;
	count: number;
	latest: {
		amount: number;
		symbol: string;
		createdAt: string;
	} | null;
};

export default function DashboardPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [initialLoad, setInitialLoad] = useState(true);
	const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics>({
		totalValue: 0,
		totalChange: 0,
		totalChangePercent: 0,
		dayChange: 0,
		dayChangePercent: 0,
		buyingPower: 0,
	});
	const [isDataLoaded, setIsDataLoaded] = useState(false);
	const [assets, setAssets] = useState<Asset[]>([]);
	const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
	const [profitSummary, setProfitSummary] = useState<ProfitSummaryState>({
		total: 0,
		count: 0,
		latest: null,
	});

	const formatProfitAmount = (amount: number, symbol: string) => {
		const formattedAmount = Math.abs(amount).toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});

		if (isUsdPeggedAsset(symbol)) {
			return `$${formattedAmount}`;
		}

		return `${symbol} ${formattedAmount}`;
	};
	const formatCurrency = (amount: number) =>
		`$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
	const [trendingStocks, setTrendingStocks] = useState<any[]>([]);
	const [trendingCrypto, setTrendingCrypto] = useState<any[]>([]);
	const [traders, setTraders] = useState<any[]>([]);
	const [copiedTraders, setCopiedTraders] = useState<Set<string>>(new Set());
	const [traderScrollIndex, setTraderScrollIndex] = useState(0);
	const [copyingTrader, setCopyingTrader] = useState<string | null>(null);
	const hotSymbols = [
		...trendingStocks.map((s) => ({
			symbol: s.symbol,
			name: s.companyName || s.name,
			change: s.changePercent || 0,
			price: s.currentPrice || 0,
			type: "stock" as const,
		})),
		...trendingCrypto.map((c) => ({
			symbol: c.symbol,
			name: c.name,
			change: c.change24h || 0,
			price: c.price || 0,
			type: "crypto" as const,
		})),
	]
		.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
		.slice(0, 5);

	console.log(user);

	useEffect(() => {
		fetchDashboardData();
		// Refresh every 30 seconds (without showing loading screen)
		const interval = setInterval(() => fetchDashboardData(false), 30000);
		return () => clearInterval(interval);
	}, [user?.id]);

	useEffect(() => {
		fetchTraders();
	}, []);

	const fetchTraders = async () => {
		try {
			const [tradersData, copiedData] = await Promise.all([
				apiGet<any[]>("/api/trader").catch(() => []),
				apiGet<any[]>("/api/trader/my-traders").catch(() => []),
			]);
			const activeTraders = tradersData.filter((t: any) => t.status === "active").slice(0, 10);
			setTraders(activeTraders);
			const copiedIds = new Set<string>(copiedData.map((t: any) => t._id));
			setCopiedTraders(copiedIds);
		} catch (error) {
			console.error("Failed to fetch traders:", error);
		}
	};

	const handleCopyTrader = async (trader: any) => {
		setCopyingTrader(trader._id);
		try {
			const url = copiedTraders.has(trader._id)
				? `/api/trader/${trader._id}/uncopy`
				: `/api/trader/${trader._id}/copy`;

			await apiPost(url, {});

			if (copiedTraders.has(trader._id)) {
				setCopiedTraders((prev) => {
					const newSet = new Set(prev);
					newSet.delete(trader._id);
					return newSet;
				});
				toast.success("Stopped copying trader");
			} else {
				setCopiedTraders((prev) => new Set(prev).add(trader._id));
				toast.success("Started copying trader");
			}
			fetchTraders();
		} catch (error: any) {
			toast.error(error?.message || "Failed to process request");
		} finally {
			setCopyingTrader(null);
		}
	};

	const scrollTraders = (direction: "left" | "right") => {
		if (direction === "left") {
			setTraderScrollIndex(Math.max(0, traderScrollIndex - 1));
		} else {
			setTraderScrollIndex(Math.min(traders.length - 3, traderScrollIndex + 1));
		}
	};

	const fetchDashboardData = async (showLoadingScreen = true) => {
		if (!user?.id) return;

		// Only show loading screen on initial load, not on auto-refresh
		if (showLoadingScreen && initialLoad) {
			setLoading(true);
		}

		try {
			console.log("=== FETCHING DASHBOARD DATA ===");
			console.log("User ID:", user.id);

			// Fetch all data in parallel where possible
			const [userData, stocks, cryptos, transactions] = await Promise.all([
				apiGet<any>(`/api/auth/users/${user.id}`).catch(() => null),
				apiGet<any>("/api/market/stocks").catch(() => []),
				apiGet<any>("/api/coins").catch(() => []),
				apiGet<any>(`/api/transaction/all?userId=${user.id}&limit=5&sort=-createdAt`).catch(() => []),
			]);

			console.log("=== API RESPONSES ===");
			console.log("User data received:", !!userData);
			console.log("Stocks count:", Array.isArray(stocks) ? stocks.length : stocks?.stocks?.length || 0);
			console.log("Cryptos count:", Array.isArray(cryptos) ? cryptos.length : cryptos?.coins?.length || 0);

			// Validate userData before processing
			if (!userData || (!userData.user && !userData.assets)) {
				console.warn("No valid user data received, skipping portfolio update");
				if (initialLoad) {
					setLoading(false);
					setInitialLoad(false);
				}
				return;
			}

			// Process portfolio data - API returns { user: {...} }
			const userAssets = userData?.user?.assets || userData?.assets || [];
			console.log("User assets extracted:", userAssets.length);

			// IMPORTANT: Validate that we have real price data before calculating portfolio
			// Backend returns price: 0 when cache is loading, which causes incorrect calculations
			const stockList = Array.isArray(stocks) ? stocks : stocks?.stocks || [];
			const cryptoList = Array.isArray(cryptos) ? cryptos : cryptos?.coins || [];

			// Check if we have valid prices (not all zeros or missing)
			const hasValidStockPrices =
				stockList.length === 0 || stockList.some((stock: any) => stock.currentPrice > 0);
			const hasValidCryptoPrices =
				cryptoList.length === 0 || cryptoList.some((coin: any) => coin.price > 0);

			// If prices are still loading (all zeros), keep showing 0 until we get real data
			if (!hasValidStockPrices || !hasValidCryptoPrices) {
				console.warn("⚠️ Market data still loading (no valid prices detected), showing 0 until ready");
				if (initialLoad) {
					setLoading(false);
					setInitialLoad(false);
				}
				// Don't update portfolio metrics - keep showing 0
				return;
			}

			const { totalValue, assetList } = buildPortfolio(userAssets, stocks, cryptos);
			const assetListWithHistory = await Promise.all(assetList.map(async (asset) => {
				if (isUsdPeggedAsset(asset.symbol)) return { ...asset, chartData: [{ value: 1 }] };
				const type = stockList.some((stock: any) => stock.symbol === asset.symbol) ? "stock" : "crypto";
				const history = await fetchAssetHistorical(asset.symbol, type, 30).catch(() => []);
				return history.length ? { ...asset, chartData: history } : asset;
			}));

			// Calculate buying power from all stablecoins (USDT, USDC, USD)
			const buyingPower = userAssets
				.filter((a: any) => ["USDT", "USDC", "USD"].includes(a.symbol))
				.reduce((total: number, asset: any) => total + (asset.spot || 0) + (asset.funding || 0), 0);

			// Calculate today's change based on the price movements of assets in portfolio
			// IMPORTANT: Exclude stablecoins (USDT, USDC, USD) from change calculations as they don't fluctuate
			let dayChange = 0;
			let dayChangePercent = 0;

			for (const asset of assetList) {
				// Skip stablecoins - they don't have price changes
				if (isUsdPeggedAsset(asset.symbol)) continue;

				if (asset.changePercent !== 0 && asset.totalValue > 0) {
					// Calculate what the value was at the start of the day
					const startOfDayValue = asset.totalValue / (1 + asset.changePercent / 100);
					const assetDayChange = asset.totalValue - startOfDayValue;
					dayChange += assetDayChange;
				}
			}

			if (totalValue > 0) {
				dayChangePercent = (dayChange / (totalValue - dayChange)) * 100;
			}

			// Process recent activity
			const txnData = Array.isArray(transactions) ? transactions : transactions?.transactions || [];
			const profitTransactions = txnData.filter((txn: any) => txn.type === "profit");
			const totalProfit = profitTransactions.reduce(
				(total: number, txn: any) => total + (Number(txn.amount) || 0),
				0,
			);
			const latestProfit = profitTransactions[0];

			setProfitSummary({
				total: totalProfit,
				count: profitTransactions.length,
				latest: latestProfit
					? {
							amount: Number(latestProfit.amount) || 0,
							symbol: latestProfit.symbol || latestProfit.currency || "USDT",
							createdAt: latestProfit.createdAt,
						}
					: null,
			});

			const activities: RecentActivityItem[] = txnData.slice(0, 5).map((txn: any) => {
				// Map transaction types to activity types
				let activityType: "buy" | "sell" | "deposit" | "withdrawal" | "profit" = "buy";

				if (txn.action === "buy") {
					activityType = "buy";
				} else if (txn.action === "sell") {
					activityType = "sell";
				} else if (txn.type === "profit") {
					activityType = "profit";
				} else if (txn.type === "deposit" || txn.type === "crypto_deposit") {
					activityType = "deposit";
				} else if (txn.type === "withdraw" || txn.type === "withdrawal" || txn.type === "crypto_withdrawal") {
					activityType = "withdrawal";
				}

				return {
					id: txn._id,
					type: activityType,
					symbol: txn.symbol,
					quantity: txn.quantity,
					price: txn.price || txn.marketPrice,
					amount: txn.amount,
					timestamp: new Date(txn.createdAt),
					status:
						txn.status === "executed" || txn.status === "completed" || txn.status === "approved"
							? "completed"
							: txn.status === "pending"
								? "pending"
								: "failed",
				};
			});

			// Process trending stocks
			const topStocks = stockList
				.filter((s: any) => s.symbol && s.currentPrice > 0)
				.sort((a: any, b: any) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0))
				.slice(0, 3);

			// Process trending crypto
			const topCryptos = cryptoList
				.filter((c: any) => c.symbol !== "USDT" && c.symbol !== "USD")
				.sort((a: any, b: any) => Math.abs(b.change24h || 0) - Math.abs(a.change24h || 0))
				.slice(0, 3);

			// Batch all state updates together using React's automatic batching
			// This prevents intermediate renders with inconsistent data
			setPortfolioMetrics({
				totalValue,
				totalChange: dayChange,
				totalChangePercent: dayChangePercent,
				dayChange,
				dayChangePercent,
				buyingPower,
			});
			setAssets(assetListWithHistory);
			setRecentActivity(activities);
			setTrendingStocks(topStocks);
			setTrendingCrypto(topCryptos);
			setIsDataLoaded(true);
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
		} finally {
			if (initialLoad) {
				setLoading(false);
				setInitialLoad(false);
			}
		}
	};

	const handleDeposit = () => {
		navigate("/dashboard/deposit");
	};

	const handleWithdraw = () => {
		navigate("/dashboard/withdrawal");
	};

	const handleTrade = () => {
		navigate("/dashboard/trade");
	};

	const handleViewAllAssets = () => {
		navigate("/dashboard/markets");
	};

	const handleViewAllActivity = () => {
		navigate("/dashboard/transactions");
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin mx-auto text-accent-500" />
					<p className="text-sm text-muted-foreground">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<p className="text-sm text-muted-foreground">Hello dear </p>
					<h1 className="text-3xl font-semibold tracking-tight">
						Welcome back{user?.name?.first ? `, ${user.name.first}` : ""}.
					</h1>
				</div>
				<div className="flex flex-wrap gap-3">
					<Link to="/dashboard/profile">
						<Button variant="outline" className="gap-2">
							<Settings className="h-4 w-4" />
							Settings
						</Button>
					</Link>
					<Link to="/dashboard/trade">
						<Button className="gap-2">
							<TrendingUp className="h-4 w-4" />
							Trade Now
						</Button>
					</Link>
				</div>
			</div>

			{/* Portfolio Summary - Top Metrics */}
			<PortfolioSummary metrics={portfolioMetrics} isDataLoaded={isDataLoaded} />

			<Card variant="elevated" padding="lg">
				<div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
					<div>
						<h3 className="text-lg font-semibold">Profit</h3>
						<p className="text-sm text-muted-foreground">Completed profit credits on this account</p>
					</div>
					<Badge variant={profitSummary.total >= 0 ? "success" : "destructive"}>
						{profitSummary.count} {profitSummary.count === 1 ? "entry" : "entries"}
					</Badge>
				</div>
				<div className="mt-5 grid gap-4 md:grid-cols-3">
					<div className="rounded-lg border border-border/60 p-4">
						<p className="text-xs text-muted-foreground">Total Profit</p>
						<p className={cn("mt-2 text-2xl font-semibold", profitSummary.total >= 0 ? "text-green-600" : "text-red-600")}>
							{profitSummary.total >= 0 ? "+" : "-"}$
							{Math.abs(profitSummary.total).toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</p>
					</div>
					<div className="rounded-lg border border-border/60 p-4">
						<p className="text-xs text-muted-foreground">Profit Entries</p>
						<p className="mt-2 text-2xl font-semibold">{profitSummary.count}</p>
					</div>
					<div className="rounded-lg border border-border/60 p-4">
						<p className="text-xs text-muted-foreground">Latest Profit</p>
						{profitSummary.latest ? (
							<div className="mt-2">
								<p className="text-lg font-semibold">
									{profitSummary.latest.amount >= 0 ? "+" : "-"}
									{formatProfitAmount(profitSummary.latest.amount, profitSummary.latest.symbol)}
								</p>
								<p className="text-xs text-muted-foreground">
									{new Date(profitSummary.latest.createdAt).toLocaleString()}
								</p>
							</div>
						) : (
							<p className="mt-2 text-sm text-muted-foreground">No profit recorded yet</p>
						)}
					</div>
				</div>
			</Card>

			{/* Quick Actions */}
			<QuickActions onDeposit={handleDeposit} onWithdraw={handleWithdraw} onTrade={handleTrade} />

			{/* Pro Traders Carousel */}
			{traders.length > 0 && (
				<Card variant="elevated" padding="lg">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h3 className="text-lg font-semibold">Copy Pro Traders</h3>
							<p className="text-sm text-muted-foreground">
								Follow and copy trades from verified professionals
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => scrollTraders("left")}
								disabled={traderScrollIndex === 0}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => scrollTraders("right")}
								disabled={traderScrollIndex >= traders.length - 3}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
							<Link to="/dashboard/traders">
								<Button variant="outline" size="sm" className="gap-2">
									View all
									<Users className="h-4 w-4" />
								</Button>
							</Link>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{traders.slice(traderScrollIndex, traderScrollIndex + 3).map((trader) => {
							const isCopied = copiedTraders.has(trader._id);
							const isProcessing = copyingTrader === trader._id;

							return (
								<Card
									key={trader._id}
									variant="elevated"
									padding="lg"
									hover="lift"
									className="border border-border/50"
								>
									<div className="space-y-5">
										<div className="flex items-center gap-3">
											<div className="relative">
												<img
													src={trader.profileImage}
													alt={trader.name}
													className="w-14 h-14 rounded-full object-cover border-2 border-border/50"
													onError={(e) => {
														(e.target as HTMLImageElement).src =
															"https://res.cloudinary.com/demo/image/upload/avatar-placeholder.png";
													}}
												/>
												{trader.verified && (
													<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background">
														<Check className="h-3 w-3 text-white" />
													</div>
												)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-semibold text-base truncate">{trader.name}</p>
												<p className="text-sm text-muted-foreground truncate">{trader.specialization}</p>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-4 border-y border-border/50 py-3 sm:grid-cols-4">
											<div className="text-center">
												<p className="text-xs text-muted-foreground mb-1">Win Rate</p>
												<p className="font-semibold text-sm">{trader.winRate}%</p>
											</div>
											<div className="text-center sm:border-l sm:border-border/50">
												<p className="text-xs text-muted-foreground mb-1">Monthly</p>
												<p className="font-semibold text-sm text-green-600">
													+{trader.profitPercentage.monthly}%
												</p>
											</div>
											<div className="text-center sm:border-l sm:border-border/50">
												<p className="text-xs text-muted-foreground mb-1">Min Copy</p>
												<p className="font-semibold text-sm">{formatCurrency(trader.minimumCopyAmount || 0)}</p>
											</div>
											<div className="text-center">
												<p className="text-xs text-muted-foreground mb-1">Copiers</p>
												<p className="font-semibold text-sm">{trader.totalCopiers}</p>
											</div>
										</div>

										<Button
											variant="outline"
											onClick={() => void handleCopyTrader(trader)}
											disabled={isProcessing}
											className={`w-full ${isCopied ? "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/20" : "border-border hover:border-purple-500 hover:text-purple-600"}`}
										>
											{isProcessing ? (
												<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
											) : isCopied ? (
												<>
													<Check className="h-4 w-4 mr-2" />
													Copied
												</>
											) : (
												"Copy Trader"
											)}
										</Button>
									</div>
								</Card>
							);
						})}
					</div>
				</Card>
			)}

			{/* Hot Symbols */}
			{hotSymbols.length > 0 && (
				<Card variant="elevated" padding="lg">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h3 className="text-lg font-semibold">Hot Symbols</h3>
							<p className="text-sm text-muted-foreground">Fast movers across stocks and crypto</p>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="gap-2"
							onClick={() => navigate("/dashboard/markets")}
						>
							View markets
							<TrendingUp className="h-4 w-4" />
						</Button>
					</div>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{hotSymbols.map((item) => {
							const isPositive = item.change >= 0;
							return (
								<div
									key={`${item.type}-${item.symbol}`}
									className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
								>
									<AssetLogo symbol={item.symbol} name={item.name} type={item.type} size={40} />
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-semibold">{item.symbol}</span>
											<span
												className={cn("text-xs font-medium", isPositive ? "text-green-600" : "text-red-600")}
											>
												{isPositive ? "+" : ""}
												{item.change.toFixed(2)}%
											</span>
										</div>
										<p className="text-sm text-muted-foreground truncate">{item.name}</p>
										<div className="flex items-center gap-2 mt-1">
											<span className="text-sm font-bold">
												$
												{item.price.toLocaleString("en-US", {
													minimumFractionDigits: 2,
													maximumFractionDigits: item.price < 1 ? 4 : 2,
												})}
											</span>
											<div className="hidden sm:block w-20 h-10">
												<PriceAreaChart
													symbol={item.symbol}
													data={generateChartData(item.price, item.change)}
													isPositive={isPositive}
													variant="compact"
													height="100%"
													showGrid={false}
												/>
											</div>
										</div>
									</div>
									<div className="flex flex-col gap-1">
										<Button
											variant="outline"
											size="sm"
											className="h-8"
											onClick={() =>
												navigate(
													item.type === "crypto"
														? `/dashboard/crypto/${item.symbol}`
														: `/dashboard/stocks/${item.symbol}`,
												)
											}
										>
											View
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				</Card>
			)}

			{/* Main Content Grid */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Asset List - Takes 2 columns */}
				<div className="lg:col-span-2">
					<AssetList assets={assets} onViewAll={handleViewAllAssets} />
				</div>

				{/* Recent Activity - Takes 1 column */}
				<div className="lg:col-span-1">
					<RecentActivity activities={recentActivity} onViewAll={handleViewAllActivity} />
				</div>
			</div>

			{/* Trending Stocks */}
			{trendingStocks.length > 0 && (
				<Card variant="elevated" padding="lg">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold mb-1">Trending Stocks</h3>
								<p className="text-sm text-muted-foreground">Top performing stocks today</p>
							</div>
							<Link to="/dashboard/stocks">
								<Button variant="ghost" size="sm" className="gap-2">
									<span>View All</span>
									<TrendingUp className="h-4 w-4" />
								</Button>
							</Link>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{trendingStocks.map((stock) => (
								<Link key={stock.symbol} to={`/dashboard/stocks/${stock.symbol}`} className="block">
									<div className="p-4 rounded-lg bg-primary-500/5 border border-primary-500/20 hover:bg-primary-500/10 transition-colors cursor-pointer">
										<div className="flex items-center gap-2 mb-2">
											<AssetLogo symbol={stock.symbol} name={stock.companyName || stock.name} size={40} />
											<div>
												<div className="text-sm font-medium text-primary-600">{stock.symbol}</div>
												<div className="text-xs text-muted-foreground truncate max-w-[100px]">
													{stock.companyName || stock.name}
												</div>
											</div>
										</div>
										<div className="text-2xl font-bold">${stock.currentPrice?.toFixed(2) || "0.00"}</div>
										<div className="text-sm text-primary-600">
											+{stock.changePercent?.toFixed(2) || "0.00"}% today
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				</Card>
			)}

			{/* Trending Crypto */}
			{trendingCrypto.length > 0 && (
				<Card variant="elevated" padding="lg">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold mb-1">Trending Crypto</h3>
								<p className="text-sm text-muted-foreground">Top performing crypto today</p>
							</div>
							<Link to="/dashboard/crypto-markets">
								<Button variant="ghost" size="sm" className="gap-2">
									<span>View All</span>
									<TrendingUp className="h-4 w-4" />
								</Button>
							</Link>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{trendingCrypto.map((crypto) => (
								<Link key={crypto.symbol} to={`/dashboard/crypto/${crypto.symbol}`} className="block">
									<div className="p-4 rounded-lg bg-accent-500/5 border border-accent-500/20 hover:bg-accent-500/10 transition-colors cursor-pointer">
										<div className="flex items-center gap-2 mb-2">
											<AssetLogo symbol={crypto.symbol} name={crypto.name} type="crypto" size={40} />
											<div>
												<div className="text-sm font-medium text-accent-600">{crypto.symbol}</div>
												<div className="text-xs text-muted-foreground truncate max-w-[100px]">
													{crypto.name}
												</div>
											</div>
										</div>
										<div className="text-2xl font-bold">
											$
											{crypto.price?.toLocaleString("en-US", {
												minimumFractionDigits: 2,
												maximumFractionDigits: crypto.price < 1 ? 4 : 2,
											}) || "0.00"}
										</div>
										<div className="text-sm text-accent-600">
											+{crypto.change24h?.toFixed(2) || "0.00"}% today
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				</Card>
			)}

		</div>
	);
}
