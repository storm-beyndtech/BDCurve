import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

interface Trader {
	_id: string;
	name: string;
	username: string;
	totalTrades: number;
	profileImage: string;
	bio: string;
	specialization: string;
	experience: number;
	profitPercentage: {
		monthly: number;
		yearly: number;
	};
	riskLevel: string;
	tradingStyle: string;
	winRate: number;
	totalCopiers: number;
	averageHoldingTime: string;
	minimumCopyAmount: number;
	copierFee: number;
	verified: boolean;
	status: string;
	tradingStreak: number;
}

export default function TradersPage() {
	const { user } = useAuth();
	const [traders, setTraders] = useState<Trader[]>([]);
	const [copiedTraders, setCopiedTraders] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
	const formatCurrency = (amount: number) =>
		`$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

	useEffect(() => {
		void fetchTraders();
		void fetchCopiedTraders();
	}, [user?.id]);

	const fetchTraders = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`${API_URL}/api/trader`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setTraders(data);
			} else {
				toast.error("Failed to fetch traders");
			}
		} catch (error) {
			console.error("Error fetching traders:", error);
			toast.error("Failed to fetch traders");
		} finally {
			setLoading(false);
		}
	};

	const fetchCopiedTraders = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`${API_URL}/api/trader/my-traders`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setCopiedTraders(new Set(data.map((trader: Trader) => trader._id)));
			}
		} catch (error) {
			console.error("Error fetching copied traders:", error);
		}
	};

	const handleCopy = async (traderId: string) => {
		setActionLoading(traderId);
		try {
			const token = localStorage.getItem("token");
			const isCopied = copiedTraders.has(traderId);
			const endpoint = isCopied ? "uncopy" : "copy";

			const response = await fetch(`${API_URL}/api/trader/${traderId}/${endpoint}`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();

			if (response.ok) {
				const updated = new Set(copiedTraders);
				if (isCopied) {
					updated.delete(traderId);
					toast.success(data.message || "Trader uncopied successfully");
				} else {
					updated.add(traderId);
					toast.success(data.message || "Trader copied successfully");
				}
				setCopiedTraders(updated);
			} else {
				toast.error(data.message || "Failed to process request");
			}
		} catch (error) {
			console.error("Error processing copy request:", error);
			toast.error("Failed to process request");
		} finally {
			setActionLoading(null);
		}
	};

	const filteredTraders = useMemo(() => {
		const term = searchTerm.toLowerCase();
		return traders.filter((trader) => {
			return (
				trader.name.toLowerCase().includes(term) ||
				trader.bio.toLowerCase().includes(term) ||
				trader.specialization.toLowerCase().includes(term)
			);
		});
	}, [traders, searchTerm]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-accent-500 border-t-transparent"></div>
					<p className="text-muted-foreground">Loading traders...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-semibold tracking-tight">Copy Trading</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Browse professional traders and copy their trading strategies.
				</p>
			</div>

			<Card variant="glass" padding="lg">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search traders by name, bio, or specialization..."
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						className="pl-10"
					/>
				</div>
			</Card>

			{filteredTraders.length === 0 ? (
				<Card variant="glass" padding="lg">
					<div className="py-12 text-center">
						<Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<p className="text-lg font-medium">No traders found</p>
						<p className="mt-1 text-sm text-muted-foreground">Try another search term.</p>
					</div>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredTraders.map((trader) => {
						const isCopied = copiedTraders.has(trader._id);
						const isProcessing = actionLoading === trader._id;

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
												className="h-16 w-16 rounded-full border-2 border-border/50 object-cover"
												onError={(event) => {
													(event.target as HTMLImageElement).src =
														"https://res.cloudinary.com/demo/image/upload/avatar-placeholder.png";
												}}
											/>
											{trader.verified && (
												<div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-blue-500">
													<Check className="h-3 w-3 text-white" />
												</div>
											)}
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate text-base font-semibold">{trader.name}</p>
											<p className="truncate text-sm text-muted-foreground">
												{trader.specialization}
											</p>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4 border-y border-border/50 py-3 sm:grid-cols-4">
										<div className="text-center">
											<p className="mb-1 text-xs text-muted-foreground">Win Rate</p>
											<p className="text-sm font-semibold">{trader.winRate}%</p>
										</div>
										<div className="text-center sm:border-l sm:border-border/50">
											<p className="mb-1 text-xs text-muted-foreground">Monthly</p>
											<p className="text-sm font-semibold text-green-600">
												+{trader.profitPercentage.monthly}%
											</p>
										</div>
										<div className="text-center sm:border-l sm:border-border/50">
											<p className="mb-1 text-xs text-muted-foreground">Min Copy</p>
											<p className="text-sm font-semibold">{formatCurrency(trader.minimumCopyAmount || 0)}</p>
										</div>
										<div className="text-center">
											<p className="mb-1 text-xs text-muted-foreground">Copiers</p>
											<p className="text-sm font-semibold">{trader.totalCopiers}</p>
										</div>
									</div>

									<div className="flex items-center justify-between">
										<Badge
											variant={
												trader.riskLevel === "Low"
													? "success"
													: trader.riskLevel === "Medium"
													? "warning"
													: "destructive"
											}
										>
											{trader.riskLevel} Risk
										</Badge>
										<Badge
											variant={
												trader.status === "active"
													? "success"
													: trader.status === "paused"
													? "warning"
													: "destructive"
											}
										>
											{trader.status}
										</Badge>
									</div>

									<Button
										variant="outline"
										onClick={() => void handleCopy(trader._id)}
										disabled={isProcessing}
										className={`w-full ${
											isCopied
												? "border-purple-500 bg-purple-50 text-purple-600 dark:bg-purple-950/20"
												: "border-border hover:border-purple-500 hover:text-purple-600"
										}`}
									>
										{isProcessing ? (
											<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
										) : isCopied ? (
											"Copied"
										) : (
											"Copy Trader"
										)}
									</Button>
								</div>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
