import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react";
import { PriceAreaChart } from "@/components/charts/price-area-chart";
import { fetchAssetHistorical } from "@/lib/historical";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useLiveQuote } from "@/hooks/useLiveQuote";
import { formatPrice, mergeLiveSeries } from "@/lib/chart-utils";

interface Asset {
	symbol: string;
	name: string;
	currentPrice: number;
	changePercent: number;
	assetType: "stock" | "crypto";
	chartData: { value: number; time?: number }[];
	high24h?: number;
	low24h?: number;
}

export default function TradePage() {
	const { user } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const symbolParam = searchParams.get("symbol");
	const typeParam = searchParams.get("type") || "stock";

	const [assetType, setAssetType] = useState<"stock" | "crypto">(typeParam as "stock" | "crypto");
	const [stocks, setStocks] = useState<any[]>([]);
	const [cryptos, setCryptos] = useState<any[]>([]);
	const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	// Trading form state
	const [action, setAction] = useState<"buy" | "sell">("buy");
	// Start empty: defaulting to 1 unit made the page immediately show "Insufficient balance" for e.g. 1 share at $368.
	const [quantity, setQuantity] = useState<string>("");
	const [orderType, setOrderType] = useState<"market" | "limit">("market");
	const [limitPrice, setLimitPrice] = useState<string>("");

	// User balance (USDT for buying)
	const [usdtBalance, setUsdtBalance] = useState<number>(0);
	const [holdings, setHoldings] = useState<Record<string, number>>({});
	// Single platform-wide minimum order value (USD), configured by admins; server enforces the same value.
	const [minTradeAmount, setMinTradeAmount] = useState<number>(100);
	const live = useLiveQuote(
		selectedAsset?.symbol || "",
		assetType,
		assetType === "crypto" && Boolean(selectedAsset),
	);

	useEffect(() => {
		if (!live.quote || !selectedAsset || selectedAsset.assetType !== "crypto") return;
		setSelectedAsset((current) => current ? {
			...current,
			currentPrice: live.quote!.price,
			changePercent: live.quote!.changePercent,
		} : current);
	}, [live.quote]);

	const displayChartData = useMemo(
		() => (selectedAsset ? mergeLiveSeries(selectedAsset.chartData, selectedAsset.assetType === "crypto" ? live.series : [], 1) : []),
		[selectedAsset, live.series],
	);

	useEffect(() => {
		fetchAssets();
		fetchUserBalance();
		apiGet<{ minTradeAmount: number }>("/api/market/settings")
			.then((res) => {
				if (Number.isFinite(res?.minTradeAmount)) setMinTradeAmount(res.minTradeAmount);
			})
			.catch(() => undefined);
	}, [user?.id]);

	useEffect(() => {
		if (symbolParam && (stocks.length > 0 || cryptos.length > 0)) {
			const symbol = symbolParam.toUpperCase();
			const assets = assetType === "stock" ? stocks : cryptos;
			const found = assets.find((a: any) => a.symbol === symbol);
			if (found) {
				selectAsset(found);
			}
		}
	}, [symbolParam, stocks, cryptos, assetType]);

	const fetchAssets = async () => {
		setLoading(true);
		try {
			// Fetch stocks
			const stocksRes = await apiGet<any>("/api/market/stocks");
			const stockList = Array.isArray(stocksRes) ? stocksRes : stocksRes?.stocks || [];
			setStocks(stockList);

			// Fetch crypto coins
			const cryptoRes = await apiGet<any>("/api/coins");
			const cryptoList = Array.isArray(cryptoRes) ? cryptoRes : cryptoRes?.coins || [];
			// Filter to only tradeable coins (excluding USDT as trading pair)
			const tradeable = cryptoList.filter((c: any) => c.symbol !== "USDT");
			setCryptos(tradeable);
		} catch (error) {
			console.error("Failed to fetch assets:", error);
			toast.error("Failed to load assets");
		} finally {
			setLoading(false);
		}
	};

	const fetchUserBalance = async () => {
		if (!user?.id) return;
		try {
			const userData = await apiGet<any>(`/api/auth/users/${user.id}`);
			// API returns { user: {...} }
			const assets = userData?.user?.assets || userData?.assets || [];
			const usdtAsset = assets.find((a: any) => a.symbol === "USDT");
			// Trades settle against the spot wallet only (server checks spot), so show spot here.
			setUsdtBalance(Number(usdtAsset?.spot || 0));
			setHoldings(Object.fromEntries(assets.map((a: any) => [String(a.symbol).toUpperCase(), Number(a.spot || 0)])));
		} catch (error) {
			console.error("Failed to fetch balance:", error);
		}
	};

	const selectAsset = async (asset: any) => {
		try {
			let price = 0;
			let change = 0;

			if (assetType === "stock") {
				// Try to fetch real-time stock quote
				try {
					const quote = await apiGet<any>(`/api/market/stock/quote?symbol=${encodeURIComponent(asset.symbol)}`);
					price = Number(quote?.price || quote?.c || asset.price || 0);
					change = Number(quote?.changePercent ?? quote?.dp ?? asset.changePercent ?? 0);
				} catch (error) {
					console.log(`Real-time quote not available for ${asset.symbol}, using mock data`);
				}

			} else {
				// Use crypto price from cache
				price = asset.price || 0;
				change = asset.change24h || asset.changePercent || 0;
			}
			if (!price || price === 0) {
				toast.error(`Live price unavailable for ${asset.symbol}. Please try again later.`);
			}

			const historical = await fetchAssetHistorical(asset.symbol, assetType, 30).catch(() => []);
			setSelectedAsset({
				symbol: asset.symbol,
				name: asset.name || asset.symbol,
				currentPrice: price,
				changePercent: change,
				assetType,
				chartData: historical,
				high24h: asset.high24h,
				low24h: asset.low24h,
			});
		} catch (error) {
			console.error("Failed to fetch asset price:", error);
			toast.error("Failed to load asset price");
		}
	};

	const calculateTotal = () => {
		if (!selectedAsset) return 0;
		const qty = parseFloat(quantity) || 0;
		const price = orderType === "limit" ? parseFloat(limitPrice) || 0 : selectedAsset.currentPrice;
		return qty * price;
	};
	const heldQuantity = selectedAsset ? holdings[selectedAsset.symbol] || 0 : 0;
	const orderTotal = calculateTotal();
	const belowMinimum = orderTotal > 0 && orderTotal < minTradeAmount;
	const insufficientHoldings = action === "sell" && (parseFloat(quantity) || 0) > heldQuantity;
	const priceUnavailable = orderType === "market" && !(selectedAsset?.currentPrice && selectedAsset.currentPrice > 0);

	const handleTrade = async () => {
		if (!selectedAsset || !user?.id) return;

		const qty = parseFloat(quantity);
		const total = calculateTotal();

		if (!qty || qty <= 0) {
			toast.error("Please enter a valid quantity");
			return;
		}

		if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
			toast.error("Please enter a valid limit price");
			return;
		}

		if (priceUnavailable) {
			toast.error("A live price is not available for this asset right now");
			return;
		}

		if (total < minTradeAmount) {
			toast.error(`Minimum order value is $${minTradeAmount.toFixed(2)}`);
			return;
		}

		if (insufficientHoldings) {
			toast.error(`Insufficient ${selectedAsset.symbol} balance. You hold ${heldQuantity}`);
			return;
		}

		// Check balance for buy orders
		if (action === "buy" && total > usdtBalance) {
			toast.error(`Insufficient balance. You need $${total.toFixed(2)} but have $${usdtBalance.toFixed(2)}`);
			return;
		}

		setSubmitting(true);
		try {
			const tradeData = {
				userId: user.id,
				action,
				orderType,
				symbol: selectedAsset.symbol,
				assetType: selectedAsset.assetType,
				amount: Number(total.toFixed(8)), // Total USDT amount
				quantity: qty, // Number of shares/coins
				...(orderType === "limit" && { limitPrice: parseFloat(limitPrice) }),
			};

			const response = await apiPost<any>("/api/transaction/trade", tradeData);

			if (response.success || response.trade) {
				const status = response.trade?.status || response.status;
				if (status === "executed") {
					toast.success(`${action === "buy" ? "Bought" : "Sold"} ${qty} ${selectedAsset.symbol} successfully!`);
				} else if (status === "pending") {
					toast.success(`Limit order placed! It will execute when price reaches $${limitPrice}`);
				} else {
					toast.success("Order submitted");
				}

				// Refresh balance
				await fetchUserBalance();

				// Reset form
				setQuantity("");
				setLimitPrice("");
			} else {
				throw new Error(response.message || "Trade failed");
			}
		} catch (error: any) {
			console.error("Trade error:", error);
			toast.error(error.message || "Failed to execute trade");
		} finally {
			setSubmitting(false);
		}
	};

	const isPositive = selectedAsset ? selectedAsset.changePercent >= 0 : false;
	const currentAssets = assetType === "stock" ? stocks : cryptos;

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin mx-auto text-accent-500" />
					<p className="text-sm text-muted-foreground">Loading assets...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-semibold tracking-tight">Trade</h1>
				<p className="text-sm text-muted-foreground">
					Buy and sell stocks and cryptocurrencies
				</p>
			</div>

			{/* Asset Type Selector */}
			<Tabs value={assetType} onValueChange={(v) => {
				setAssetType(v as "stock" | "crypto");
				setSelectedAsset(null);
				setSearchParams({});
			}}>
				<TabsList>
					<TabsTrigger value="stock">Stocks</TabsTrigger>
					<TabsTrigger value="crypto">Crypto</TabsTrigger>
				</TabsList>

				<TabsContent value={assetType} className="mt-6">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Asset Selection & Info */}
						<div className="lg:col-span-1 space-y-4">
							{/* Asset Selector */}
							<Card variant="elevated" padding="lg">
								<div className="space-y-4">
									<div>
										<label className="text-sm font-medium mb-2 block">
											Select {assetType === "stock" ? "Stock" : "Crypto"}
										</label>
										<select
											className="w-full p-2 rounded-lg bg-background border border-border text-sm"
											value={selectedAsset?.symbol || ""}
											onChange={(e) => {
												const asset = currentAssets.find((a: any) => a.symbol === e.target.value);
												if (asset) selectAsset(asset);
											}}
										>
											<option value="">Choose an asset...</option>
											{currentAssets.map((asset: any) => (
												<option key={asset.symbol} value={asset.symbol}>
													{asset.symbol} - {asset.name || asset.symbol}
												</option>
											))}
										</select>
									</div>

									{selectedAsset && (
										<>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<span className="text-2xl font-bold">
														{selectedAsset.symbol}
													</span>
													<Badge
														variant={isPositive ? "default" : "destructive"}
														className="gap-1"
													>
														{isPositive ? (
															<TrendingUp className="h-3 w-3" />
														) : (
															<TrendingDown className="h-3 w-3" />
														)}
														<span>
															{isPositive ? "+" : ""}
															{selectedAsset.changePercent.toFixed(2)}%
														</span>
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground">
													{selectedAsset.name}
												</p>
											</div>

											<div className="h-20">
												<PriceAreaChart
													symbol={selectedAsset.symbol}
													data={displayChartData}
													isPositive={isPositive}
													variant="compact"
													height="100%"
													showGrid={false}
												/>
											</div>

											<div className="p-3 rounded-lg bg-muted/50">
												<p className="text-sm text-muted-foreground mb-1">
													Current Price
												</p>
												<p className="text-2xl font-bold">
													{selectedAsset.currentPrice > 0 ? `$${formatPrice(selectedAsset.currentPrice)}` : "—"}
												</p>
											</div>

											{/* User Balance */}
											<div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
												<p className="text-sm text-blue-600 mb-1">
													Available Balance
												</p>
												<p className="text-lg font-bold text-blue-600">
													${usdtBalance.toLocaleString("en-US", {
														minimumFractionDigits: 2,
														maximumFractionDigits: 2,
													})}
												</p>
											</div>
										</>
									)}
								</div>
							</Card>
						</div>

						{/* Trading Form */}
						<div className="lg:col-span-2">
							<Card variant="elevated" padding="lg">
								<div className="space-y-6">
									<div>
										<h3 className="text-lg font-semibold mb-4">Place Order</h3>

										{!selectedAsset && (
											<div className="text-center py-12">
												<p className="text-muted-foreground">
													Select an asset to start trading
												</p>
											</div>
										)}

										{selectedAsset && (
											<div className="space-y-6">
												{/* Buy/Sell Toggle */}
												<div className="flex gap-2">
													<Button
														variant={action === "buy" ? "primary" : "outline"}
														className="flex-1"
														onClick={() => setAction("buy")}
													>
														Buy
													</Button>
													<Button
														variant={action === "sell" ? "destructive" : "outline"}
														className="flex-1"
														onClick={() => setAction("sell")}
													>
														Sell
													</Button>
												</div>

												{/* Order Type */}
												<div>
													<label className="text-sm font-medium mb-2 block">
														Order Type
													</label>
													<div className="flex gap-2">
														<Button
															variant="outline"
															className={`flex-1 ${orderType === "market" ? "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/20" : "border-border"}`}
															onClick={() => setOrderType("market")}
														>
															Market
														</Button>
														<Button
															variant="outline"
															className={`flex-1 ${orderType === "limit" ? "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/20" : "border-border"}`}
															onClick={() => setOrderType("limit")}
														>
															Limit
														</Button>
													</div>
													<p className="text-xs text-muted-foreground mt-1">
														{orderType === "market"
															? "Execute immediately at current market price"
															: "Execute when price reaches your limit price"}
													</p>
												</div>

												{/* Quantity Input */}
												<div>
													<label className="text-sm font-medium mb-2 block">
														Quantity ({assetType === "stock" ? "shares" : "coins"})
													</label>
													<Input
														type="number"
														inputMode="decimal"
														min="0"
														step="any"
														value={quantity}
														onChange={(e) => setQuantity(e.target.value)}
														placeholder="Enter quantity"
													/>
													<p className="text-xs text-muted-foreground mt-1">
														Minimum order value: ${minTradeAmount.toFixed(2)}
														{action === "sell" && ` · You hold ${heldQuantity} ${selectedAsset.symbol}`}
													</p>
												</div>

												{/* Limit Price (if limit order) */}
												{orderType === "limit" && (
													<div>
														<label className="text-sm font-medium mb-2 block">
															Limit Price ($)
														</label>
														<Input
															type="number"
															min="0"
															step="0.01"
															value={limitPrice}
															onChange={(e) => setLimitPrice(e.target.value)}
															placeholder="Enter limit price"
														/>
														<p className="text-xs text-muted-foreground mt-1">
															Order will execute when price reaches this level
														</p>
													</div>
												)}

												{/* Order Summary */}
												<div className="p-4 rounded-lg bg-muted/50 space-y-2">
													<div className="flex items-center justify-between">
														<span className="text-sm text-muted-foreground">
															Quantity
														</span>
														<span className="font-medium">{quantity || 0}</span>
													</div>
													<div className="flex items-center justify-between">
														<span className="text-sm text-muted-foreground">
															Price per {assetType === "stock" ? "share" : "coin"}
														</span>
														<span className="font-medium">
															$
															{formatPrice(
																orderType === "limit" ? parseFloat(limitPrice) || 0 : selectedAsset.currentPrice
															)}
														</span>
													</div>
													<div className="pt-2 border-t border-border flex items-center justify-between">
														<span className="font-semibold">Estimated Total</span>
														<span className="text-2xl font-bold">
															$
															{calculateTotal().toLocaleString("en-US", {
																minimumFractionDigits: 2,
																maximumFractionDigits: 2,
															})}
														</span>
													</div>
												</div>

												{/* Warning for insufficient balance */}
												{action === "buy" && orderTotal > 0 && orderTotal > usdtBalance && (
													<div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-2">
														<AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
														<div className="flex-1">
															<p className="text-sm font-medium text-red-600">Insufficient Balance</p>
															<p className="text-xs text-red-600/80 mt-1">
																You need ${calculateTotal().toFixed(2)} but only have ${usdtBalance.toFixed(2)}. Please deposit funds first.
															</p>
														</div>
													</div>
												)}

												{belowMinimum && (
													<p className="text-sm text-amber-600">
														Order value is below the platform minimum of ${minTradeAmount.toFixed(2)}.
													</p>
												)}
												{insufficientHoldings && (
													<p className="text-sm text-red-600">
														You only hold {heldQuantity} {selectedAsset.symbol}.
													</p>
												)}

												{/* Submit Button */}
												<Button
													variant={action === "buy" ? "primary" : "destructive"}
													size="lg"
													className="w-full"
													onClick={handleTrade}
													disabled={
														submitting ||
														!quantity ||
														parseFloat(quantity) <= 0 ||
														(orderType === "limit" &&
															(!limitPrice || parseFloat(limitPrice) <= 0)) ||
														(action === "buy" && calculateTotal() > usdtBalance) ||
														orderTotal < minTradeAmount ||
														insufficientHoldings ||
														priceUnavailable
													}
												>
													{submitting ? (
														<>
															<Loader2 className="h-4 w-4 animate-spin mr-2" />
															Processing...
														</>
													) : (
														<>
															{action === "buy" ? "Buy" : "Sell"} {selectedAsset.symbol}
														</>
													)}
												</Button>
											</div>
										)}
									</div>
								</div>
							</Card>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
