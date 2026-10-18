import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
	Coins,
	TrendingUp,
	DollarSign,
	Settings2,
	Plus,
	Save,
	Eye,
	EyeOff,
	Globe,
	Network,
	Wallet,
	AlertCircle,
	CheckCircle2,
	XCircle,
	Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CoinConfig = {
	_id?: string;
	symbol: string;
	name: string;
	network: string;
	address: string;
	minWithdraw: number;
	minDeposit: number;
	withdrawalFee: number;
	deposit: boolean;
	withdraw: boolean;
	isActive?: boolean;
};

type StockConfig = {
	_id?: string;
	symbol: string;
	name: string;
	isActive: boolean;
};

type PlatformFees = {
	trading: string;
	withdrawal: string;
	conversion: string;
	depositFixed: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const numberOr = (val: any, fallback = 0) => {
	const n = Number(val);
	return Number.isFinite(n) ? n : fallback;
};

export default function AdminSettingsPage() {
	const [coins, setCoins] = useState<CoinConfig[]>([]);
	const [stocks, setStocks] = useState<StockConfig[]>([]);
	const [loading, setLoading] = useState(true);
	const [savingSymbol, setSavingSymbol] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"crypto" | "stocks" | "fees">("crypto");

	// Fees state
	const [fees, setFees] = useState<PlatformFees>({
		trading: localStorage.getItem("fee-trading") || "0.25",
		withdrawal: localStorage.getItem("fee-withdrawal") || "0.1",
		conversion: localStorage.getItem("fee-conversion") || "0.2",
		depositFixed: localStorage.getItem("fee-deposit-fixed") || "0",
	});


	// New coin form
	const [newCoin, setNewCoin] = useState<Partial<CoinConfig>>({
		symbol: "",
		name: "",
		network: "",
		address: "",
		minDeposit: 10,
		minWithdraw: 10,
		withdrawalFee: 0.5,
		deposit: true,
		withdraw: true,
	});

	// New stock form
	const [newStock, setNewStock] = useState("");

	// UI state
	const [showAddressFor, setShowAddressFor] = useState<Set<string>>(new Set());

	useEffect(() => {
		fetchConfigs();
	}, []);

	const authHeaders = (): Record<string, string> => {
		const headers: Record<string, string> = { "Content-Type": "application/json" };
		const token = localStorage.getItem("token");
		if (token) headers["Authorization"] = `Bearer ${token}`;
		return headers;
	};

	const fetchConfigs = async () => {
		setLoading(true);
		try {
			const [coinsRes, stocksRes] = await Promise.all([
				fetch(`${API_URL}/api/coins`, { headers: authHeaders() }),
				fetch(`${API_URL}/api/market/stocks`, { headers: authHeaders() }),
			]);

			const coinsJson = await coinsRes.json().catch(() => []);
			const stocksJson = await stocksRes.json().catch(() => []);
			setCoins(Array.isArray(coinsJson) ? coinsJson : coinsJson?.coins || []);
			setStocks(Array.isArray(stocksJson) ? stocksJson : stocksJson?.stocks || []);
		} catch (error) {
			console.error("Failed to fetch settings:", error);
			toast.error("Unable to load settings data");
		} finally {
			setLoading(false);
		}
	};

	const handleCoinUpdate = async (coin: CoinConfig) => {
		setSavingSymbol(coin.symbol);
		try {
			const res = await fetch(`${API_URL}/api/coins/update/${coin.symbol}`, {
				method: "PUT",
				headers: authHeaders(),
				body: JSON.stringify(coin),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.message || "Update failed");
			}
			toast.success(`${coin.symbol} updated successfully`);
			await fetchConfigs();
		} catch (error: any) {
			console.error("Coin update error:", error);
			toast.error(error.message || "Failed to update coin");
		} finally {
			setSavingSymbol(null);
		}
	};

	const handleAddCoin = async () => {
		if (!newCoin.symbol || !newCoin.name) {
			toast.error("Symbol and name are required");
			return;
		}
		setSavingSymbol(newCoin.symbol);
		try {
			const res = await fetch(`${API_URL}/api/coins/create/${newCoin.symbol}`, {
				method: "POST",
				headers: authHeaders(),
				body: JSON.stringify({
					...newCoin,
					minDeposit: numberOr(newCoin.minDeposit, 0),
					minWithdraw: numberOr(newCoin.minWithdraw, 0),
					withdrawalFee: numberOr(newCoin.withdrawalFee, 0),
				}),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.message || "Create failed");
			}
			toast.success(`${newCoin.symbol} added successfully`);
			setNewCoin({
				symbol: "",
				name: "",
				network: "",
				address: "",
				minDeposit: 10,
				minWithdraw: 10,
				withdrawalFee: 0.5,
				deposit: true,
				withdraw: true,
			});
			await fetchConfigs();
		} catch (error: any) {
			console.error("Add coin error:", error);
			toast.error(error.message || "Failed to add coin");
		} finally {
			setSavingSymbol(null);
		}
	};

	const handleStockToggle = async (symbol: string, isActive: boolean) => {
		setSavingSymbol(symbol);
		try {
			const res = await fetch(`${API_URL}/api/market/stock/${symbol}/status`, {
				method: "PUT",
				headers: authHeaders(),
				body: JSON.stringify({ isActive }),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.message || "Failed to update stock");
			}
			toast.success(`${symbol} ${isActive ? "enabled" : "disabled"} successfully`);
			await fetchConfigs();
		} catch (error: any) {
			console.error("Stock status error:", error);
			toast.error(error.message || "Failed to update stock");
		} finally {
			setSavingSymbol(null);
		}
	};

	const handleAddStock = async () => {
		if (!newStock.trim()) {
			toast.error("Enter a stock symbol");
			return;
		}
		setSavingSymbol(newStock.toUpperCase());
		try {
			const res = await fetch(`${API_URL}/api/market/stock/add`, {
				method: "POST",
				headers: authHeaders(),
				body: JSON.stringify({ symbol: newStock.toUpperCase() }),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.message || "Failed to add stock");
			}
			toast.success(`${newStock.toUpperCase()} added successfully`);
			setNewStock("");
			await fetchConfigs();
		} catch (error: any) {
			console.error("Add stock error:", error);
			toast.error(error.message || "Failed to add stock");
		} finally {
			setSavingSymbol(null);
		}
	};

	const saveFees = () => {
		localStorage.setItem("fee-trading", fees.trading);
		localStorage.setItem("fee-withdrawal", fees.withdrawal);
		localStorage.setItem("fee-conversion", fees.conversion);
		localStorage.setItem("fee-deposit-fixed", fees.depositFixed);
		toast.success("Fees saved successfully");
	};

	const toggleAddressVisibility = (symbol: string) => {
		setShowAddressFor((prev) => {
			const next = new Set(prev);
			if (next.has(symbol)) {
				next.delete(symbol);
			} else {
				next.add(symbol);
			}
			return next;
		});
	};


	const tabButtons = [
		{ key: "crypto" as const, label: "Cryptocurrency", icon: Coins, count: coins.length },
		{ key: "stocks" as const, label: "Stocks & Shares", icon: TrendingUp, count: stocks.length },
		{ key: "fees" as const, label: "Platform Fees", icon: DollarSign, count: 0 },
	];

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-500 border-r-transparent"></div>
					<p className="text-sm text-muted-foreground">Loading settings...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
						<Settings2 className="h-8 w-8 text-accent-500" />
						Platform Settings
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage assets, trading configuration, fees, and payment systems
					</p>
				</div>
				<div className="flex gap-2">
					<Badge variant="glass" className="text-sm px-3 py-1">
						<Info className="h-3 w-3 mr-1" />
						{coins.length} Crypto • {stocks.length} Stocks
					</Badge>
				</div>
			</div>

			{/* Tab Navigation */}
			<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
				{tabButtons.map((tab) => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.key;
					return (
						<Card
							key={tab.key}
							variant={isActive ? "elevated" : "glass"}
							padding="md"
							hover="lift"
							className={cn(
								"cursor-pointer transition-all",
								isActive && "ring-2 ring-accent-500/50 shadow-lg"
							)}
							onClick={() => setActiveTab(tab.key)}
						>
							<div className="flex items-center gap-3">
								<div className={cn("p-2 rounded-lg", isActive ? "bg-accent-500" : "bg-accent-500/10")}>
									<Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-accent-600")} />
								</div>
								<div className="flex-1 min-w-0">
									<p className={cn("text-sm font-semibold truncate", isActive && "text-accent-600")}>
										{tab.label}
									</p>
									{tab.count > 0 && (
										<p className="text-xs text-muted-foreground">{tab.count} items</p>
									)}
								</div>
							</div>
						</Card>
					);
				})}
			</div>

			{/* Crypto Tab */}
			{activeTab === "crypto" && (
				<div className="space-y-6">
					{/* Crypto Assets List */}
					<Card variant="elevated" padding="lg" hover="lift">
						<CardHeader className="p-0 space-y-2 mb-6">
							<CardTitle className="text-xl flex items-center gap-2">
								<Coins className="h-5 w-5 text-accent-500" />
								Cryptocurrency Wallets
							</CardTitle>
							<CardDescription>Configure deposit/withdrawal settings and wallet addresses for each cryptocurrency</CardDescription>
						</CardHeader>
						<CardContent className="p-0 space-y-4">
							{coins.map((coin) => (
								<Card key={coin.symbol} variant="glass" padding="lg" hover="glow">
									<div className="space-y-4">
										{/* Header Row */}
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-3">
												<div className="p-2 rounded-lg bg-accent-500/10">
													<Coins className="h-5 w-5 text-accent-600" />
												</div>
												<div>
													<div className="flex items-center gap-2">
														<h3 className="text-lg font-semibold">{coin.symbol}</h3>
														<Badge variant="outline" className="text-xs">
															<Network className="h-3 w-3 mr-1" />
															{coin.network}
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground">{coin.name}</p>
												</div>
											</div>
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="outline"
													disabled={savingSymbol === coin.symbol}
													onClick={() => handleCoinUpdate(coin)}
												>
													<Save className="h-3 w-3 mr-1" />
													{savingSymbol === coin.symbol ? "Saving..." : "Save"}
												</Button>
											</div>
										</div>

										{/* Wallet Address */}
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<label className="text-sm font-medium flex items-center gap-1.5">
													<Wallet className="h-3.5 w-3.5 text-muted-foreground" />
													Deposit Wallet Address
												</label>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => toggleAddressVisibility(coin.symbol)}
													className="h-6 text-xs"
												>
													{showAddressFor.has(coin.symbol) ? (
														<><EyeOff className="h-3 w-3 mr-1" /> Hide</>
													) : (
														<><Eye className="h-3 w-3 mr-1" /> Show</>
													)}
												</Button>
											</div>

											<Input
												type={showAddressFor.has(coin.symbol) ? "text" : "password"}
												value={coin.address || ""}
												onChange={(e) =>
													setCoins((prev) =>
														prev.map((c) => (c.symbol === coin.symbol ? { ...c, address: e.target.value } : c))
													)
												}
												placeholder={`${coin.symbol} deposit address`}
												className="font-mono"
											/>
											{coin.address ? (
												<p className="text-xs text-green-600 flex items-center gap-1">
													<CheckCircle2 className="h-3 w-3" /> Address configured
												</p>
											) : (
												<p className="text-xs text-amber-600 flex items-center gap-1">
													<AlertCircle className="h-3 w-3" /> No address set — users will see "Address not configured"
												</p>
											)}
										</div>

										{/* Limits Grid */}
										<div className="grid gap-3 md:grid-cols-3">
											<div className="space-y-2">
												<label className="text-xs font-medium text-muted-foreground">Minimum Deposit</label>
												<Input
													type="number"
													step="0.01"
													value={coin.minDeposit}
													onChange={(e) =>
														setCoins((prev) =>
															prev.map((c) =>
																c.symbol === coin.symbol ? { ...c, minDeposit: numberOr(e.target.value) } : c
															)
														)
													}
													placeholder="0.00"
												/>
											</div>
											<div className="space-y-2">
												<label className="text-xs font-medium text-muted-foreground">Minimum Withdrawal</label>
												<Input
													type="number"
													step="0.01"
													value={coin.minWithdraw}
													onChange={(e) =>
														setCoins((prev) =>
															prev.map((c) =>
																c.symbol === coin.symbol ? { ...c, minWithdraw: numberOr(e.target.value) } : c
															)
														)
													}
													placeholder="0.00"
												/>
											</div>
											<div className="space-y-2">
												<label className="text-xs font-medium text-muted-foreground">Withdrawal Fee (%)</label>
												<Input
													type="number"
													step="0.01"
													value={coin.withdrawalFee}
													onChange={(e) =>
														setCoins((prev) =>
															prev.map((c) =>
																c.symbol === coin.symbol ? { ...c, withdrawalFee: numberOr(e.target.value) } : c
															)
														)
													}
													placeholder="0.00"
												/>
											</div>
										</div>

										{/* Status Toggles */}
										<div className="flex items-center gap-4 pt-2 border-t border-border/50">
											<div className="flex-1 flex items-center justify-between">
												<div className="flex items-center gap-2">
													<CheckCircle2 className="h-4 w-4 text-green-600" />
													<span className="text-sm font-medium">Deposits</span>
												</div>
												<Button
													size="sm"
													variant={coin.deposit ? "primary" : "outline"}
													onClick={() =>
														setCoins((prev) =>
															prev.map((c) => (c.symbol === coin.symbol ? { ...c, deposit: !c.deposit } : c))
														)
													}
													className={cn("h-8 w-20", coin.deposit && "bg-green-600 hover:bg-green-700")}
												>
													{coin.deposit ? "Enabled" : "Disabled"}
												</Button>
											</div>
											<div className="flex-1 flex items-center justify-between">
												<div className="flex items-center gap-2">
													<XCircle className="h-4 w-4 text-orange-600" />
													<span className="text-sm font-medium">Withdrawals</span>
												</div>
												<Button
													size="sm"
													variant={coin.withdraw ? "primary" : "outline"}
													onClick={() =>
														setCoins((prev) =>
															prev.map((c) => (c.symbol === coin.symbol ? { ...c, withdraw: !c.withdraw } : c))
														)
													}
													className={cn("h-8 w-20", coin.withdraw && "bg-green-600 hover:bg-green-700")}
												>
													{coin.withdraw ? "Enabled" : "Disabled"}
												</Button>
											</div>
										</div>
									</div>
								</Card>
							))}
						</CardContent>
					</Card>

					{/* Add New Coin */}
					<Card variant="glass" padding="lg" className="border-dashed">
						<CardHeader className="p-0 space-y-2 mb-4">
							<CardTitle className="text-lg flex items-center gap-2">
								<Plus className="h-5 w-5" />
								Add New Cryptocurrency
							</CardTitle>
							<CardDescription>Add a new cryptocurrency to the platform</CardDescription>
						</CardHeader>
						<CardContent className="p-0">
							<div className="grid gap-4 md:grid-cols-2">
								<Input
									placeholder="Symbol (e.g., XRP)"
									value={newCoin.symbol}
									onChange={(e) => setNewCoin((prev) => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
								/>
								<Input
									placeholder="Full Name (e.g., Ripple)"
									value={newCoin.name}
									onChange={(e) => setNewCoin((prev) => ({ ...prev, name: e.target.value }))}
								/>
								<Input
									placeholder="Network (e.g., XRP)"
									value={newCoin.network}
									onChange={(e) => setNewCoin((prev) => ({ ...prev, network: e.target.value }))}
								/>
								<Input
									placeholder="Wallet Address"
									value={newCoin.address}
									onChange={(e) => setNewCoin((prev) => ({ ...prev, address: e.target.value }))}
								/>
								<Input
									type="number"
									placeholder="Min Deposit"
									value={newCoin.minDeposit}
									onChange={(e) => setNewCoin((prev) => ({ ...prev, minDeposit: numberOr(e.target.value) }))}
								/>
								<Input
									type="number"
									placeholder="Min Withdrawal"
									value={newCoin.minWithdraw}
									onChange={(e) => setNewCoin((prev) => ({ ...prev, minWithdraw: numberOr(e.target.value) }))}
								/>
								<Input
									type="number"
									placeholder="Withdrawal Fee (%)"
									value={newCoin.withdrawalFee}
									onChange={(e) => setNewCoin((prev) => ({ ...prev, withdrawalFee: numberOr(e.target.value) }))}
								/>
								<Button onClick={handleAddCoin} disabled={!!savingSymbol} className="md:col-span-1">
									<Plus className="h-4 w-4 mr-2" />
									{savingSymbol === newCoin.symbol ? "Adding..." : "Add Cryptocurrency"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Stocks Tab */}
			{activeTab === "stocks" && (
				<div className="space-y-6">
					<Card variant="elevated" padding="lg" hover="lift">
						<CardHeader className="p-0 space-y-2 mb-6">
							<CardTitle className="text-xl flex items-center gap-2">
								<TrendingUp className="h-5 w-5 text-primary-500" />
								Stock Symbols
							</CardTitle>
							<CardDescription>Enable/disable stock symbols and add new listings for trading</CardDescription>
						</CardHeader>
						<CardContent className="p-0 space-y-3">
							<div className="grid gap-3 md:grid-cols-2">
								{stocks.map((stock) => (
									<Card key={stock.symbol} variant="glass" padding="md" hover="glow">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className={cn("p-2 rounded-lg", stock.isActive ? "bg-green-500/10" : "bg-muted")}>
													<TrendingUp className={cn("h-4 w-4", stock.isActive ? "text-green-600" : "text-muted-foreground")} />
												</div>
												<div>
													<p className="font-semibold">{stock.symbol}</p>
													<p className="text-xs text-muted-foreground truncate max-w-[200px]">{stock.name}</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Badge variant={stock.isActive ? "success" : "outline"} className="text-xs">
													{stock.isActive ? "Active" : "Disabled"}
												</Badge>
												<Button
													size="sm"
													variant={stock.isActive ? "primary" : "outline"}
													onClick={() => handleStockToggle(stock.symbol, !stock.isActive)}
													disabled={savingSymbol === stock.symbol}
													className={cn("h-7 w-16 text-xs", stock.isActive && "bg-green-600 hover:bg-green-700")}
												>
													{stock.isActive ? "On" : "Off"}
												</Button>
											</div>
										</div>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Add Stock */}
					<Card variant="glass" padding="lg" className="border-dashed">
						<CardHeader className="p-0 space-y-2 mb-4">
							<CardTitle className="text-lg flex items-center gap-2">
								<Plus className="h-5 w-5" />
								Add Stock Symbol
							</CardTitle>
							<CardDescription>Add a new stock symbol with live profile lookup from provider</CardDescription>
						</CardHeader>
						<CardContent className="p-0">
							<div className="flex gap-3">
								<Input
									placeholder="Enter stock symbol (e.g., NVDA)"
									value={newStock}
									onChange={(e) => setNewStock(e.target.value.toUpperCase())}
									className="flex-1"
								/>
								<Button onClick={handleAddStock} disabled={!!savingSymbol}>
									<Plus className="h-4 w-4 mr-2" />
									{savingSymbol === newStock ? "Adding..." : "Add Stock"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Fees Tab */}
			{activeTab === "fees" && (
				<div className="space-y-6">
					<Card variant="elevated" padding="lg" hover="lift">
						<CardHeader className="p-0 space-y-2 mb-6">
							<CardTitle className="text-xl flex items-center gap-2">
								<DollarSign className="h-5 w-5 text-green-500" />
								Platform Fees Configuration
							</CardTitle>
							<CardDescription>Configure platform-wide transaction fees (stored locally)</CardDescription>
						</CardHeader>
						<CardContent className="p-0">
							<div className="grid gap-6 md:grid-cols-2">
								<Card variant="glass" padding="lg">
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<div className="p-2 rounded-lg bg-accent-500/10">
												<TrendingUp className="h-4 w-4 text-accent-600" />
											</div>
											<div>
												<p className="font-semibold">Trading Fee</p>
												<p className="text-xs text-muted-foreground">Percentage charged per trade</p>
											</div>
										</div>
										<div className="relative">
											<Input
												type="number"
												step="0.01"
												value={fees.trading}
												onChange={(e) => setFees((prev) => ({ ...prev, trading: e.target.value }))}
												placeholder="0.00"
												className="pr-8"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
										</div>
									</div>
								</Card>

								<Card variant="glass" padding="lg">
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<div className="p-2 rounded-lg bg-orange-500/10">
												<Wallet className="h-4 w-4 text-orange-600" />
											</div>
											<div>
												<p className="font-semibold">Withdrawal Fee</p>
												<p className="text-xs text-muted-foreground">Percentage charged per withdrawal</p>
											</div>
										</div>
										<div className="relative">
											<Input
												type="number"
												step="0.01"
												value={fees.withdrawal}
												onChange={(e) => setFees((prev) => ({ ...prev, withdrawal: e.target.value }))}
												placeholder="0.00"
												className="pr-8"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
										</div>
									</div>
								</Card>

								<Card variant="glass" padding="lg">
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<div className="p-2 rounded-lg bg-purple-500/10">
												<Globe className="h-4 w-4 text-purple-600" />
											</div>
											<div>
												<p className="font-semibold">Conversion Fee</p>
												<p className="text-xs text-muted-foreground">Percentage charged for currency conversion</p>
											</div>
										</div>
										<div className="relative">
											<Input
												type="number"
												step="0.01"
												value={fees.conversion}
												onChange={(e) => setFees((prev) => ({ ...prev, conversion: e.target.value }))}
												placeholder="0.00"
												className="pr-8"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
										</div>
									</div>
								</Card>

								<Card variant="glass" padding="lg">
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<div className="p-2 rounded-lg bg-green-500/10">
												<DollarSign className="h-4 w-4 text-green-600" />
											</div>
											<div>
												<p className="font-semibold">Fixed Deposit Fee</p>
												<p className="text-xs text-muted-foreground">Fixed amount charged per deposit</p>
											</div>
										</div>
										<div className="relative">
											<span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
											<Input
												type="number"
												step="0.01"
												value={fees.depositFixed}
												onChange={(e) => setFees((prev) => ({ ...prev, depositFixed: e.target.value }))}
												placeholder="0.00"
												className="pl-8"
											/>
										</div>
									</div>
								</Card>
							</div>

							<div className="mt-6 flex justify-end">
								<Button onClick={saveFees}>
									<Save className="h-4 w-4 mr-2" />
									Save Fee Configuration
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Fee Info Card */}
					<Card variant="glass" padding="lg" className="bg-accent-500/5">
						<div className="flex items-start gap-3">
							<AlertCircle className="h-5 w-5 text-accent-500 mt-0.5" />
							<div className="flex-1">
								<p className="font-semibold text-sm">Note about fee storage</p>
								<p className="text-xs text-muted-foreground mt-1">
									Fee configurations are currently stored in browser localStorage for quick access. Consider implementing server-side
									storage for production environments to ensure consistency across admin sessions.
								</p>
							</div>
						</div>
					</Card>
				</div>
			)}

		</div>
	);
}
