import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

interface LiveTrade {
	_id: string;
	symbol: string;
	category: string;
	expectedProfit: number;
	status: "open" | "closed";
	openedAt: string;
	closedAt?: string;
}

const CATEGORIES = ["Crypto", "Forex", "Stocks", "Commodities", "Options", "Indices", "Mixed"];

export default function LiveTradesPage() {
	const [trades, setTrades] = useState<LiveTrade[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		symbol: "",
		category: "Crypto",
		expectedProfit: "",
	});

	useEffect(() => {
		void fetchTrades();
	}, []);

	const fetchTrades = async () => {
		setLoading(true);
		try {
			const data = await apiGet<LiveTrade[]>("/api/live-trade");
			setTrades(data);
		} catch (error) {
			console.error("Failed to fetch live trades:", error);
			toast.error("Failed to fetch live trades");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!formData.symbol || !formData.category || !formData.expectedProfit) {
			toast.error("Please fill all required fields");
			return;
		}

		try {
			await apiPost("/api/live-trade", {
				symbol: formData.symbol.toUpperCase(),
				category: formData.category,
				expectedProfit: Number(formData.expectedProfit),
			});

			toast.success("Live trade created successfully");
			setShowForm(false);
			setFormData({
				symbol: "",
				category: "Crypto",
				expectedProfit: "",
			});
			await fetchTrades();
		} catch (error: any) {
			console.error("Failed to create live trade:", error);
			toast.error(error?.message || "Failed to create live trade");
		}
	};

	const handleCloseTrade = async (id: string) => {
		try {
			await apiPut(`/api/live-trade/${id}`, {
				status: "closed",
			});
			toast.success("Trade closed successfully");
			await fetchTrades();
		} catch (error: any) {
			console.error("Failed to close live trade:", error);
			toast.error(error?.message || "Failed to close trade");
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await apiDelete(`/api/live-trade/${id}`);
			toast.success("Live trade deleted successfully");
			setDeleteConfirm(null);
			await fetchTrades();
		} catch (error: any) {
			console.error("Failed to delete live trade:", error);
			toast.error(error?.message || "Failed to delete live trade");
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="space-y-4 text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent-500 border-r-transparent"></div>
					<p className="text-sm text-muted-foreground">Loading live trades...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">Live Trades</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Create and manage live trades for copy trading
					</p>
				</div>
				<Button onClick={() => setShowForm(true)} className="gap-2">
					<Plus className="h-4 w-4" />
					Create Trade
				</Button>
			</div>

			{showForm && (
				<Card variant="glass" padding="lg">
					<CardHeader className="mb-6 flex flex-row items-center justify-between p-0">
						<CardTitle className="text-lg">Create Live Trade</CardTitle>
						<Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
							<X className="h-4 w-4" />
						</Button>
					</CardHeader>
					<CardContent className="p-0">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid gap-4 md:grid-cols-3">
								<div>
									<Label htmlFor="symbol">Symbol</Label>
									<Input
										id="symbol"
										placeholder="e.g., BTCUSDT"
										value={formData.symbol}
										onChange={(event) =>
											setFormData((current) => ({
												...current,
												symbol: event.target.value,
											}))
										}
										required
									/>
								</div>

								<div>
									<Label htmlFor="category">Category</Label>
									<select
										id="category"
										value={formData.category}
										onChange={(event) =>
											setFormData((current) => ({
												...current,
												category: event.target.value,
											}))
										}
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									>
										{CATEGORIES.map((category) => (
											<option key={category} value={category}>
												{category}
											</option>
										))}
									</select>
								</div>

								<div>
									<Label htmlFor="expectedProfit">Expected Profit %</Label>
									<Input
										id="expectedProfit"
										type="number"
										step="0.1"
										placeholder="5.0"
										value={formData.expectedProfit}
										onChange={(event) =>
											setFormData((current) => ({
												...current,
												expectedProfit: event.target.value,
											}))
										}
										required
									/>
								</div>
							</div>

							<div className="flex justify-end gap-3 border-t border-border pt-4">
								<Button type="button" variant="outline" onClick={() => setShowForm(false)}>
									Cancel
								</Button>
								<Button type="submit">Create Trade</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			<Card variant="glass" padding="lg">
				<CardHeader className="mb-6 p-0">
					<CardTitle className="text-lg">All Trades ({trades.length})</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{trades.length === 0 ? (
						<div className="py-12 text-center">
							<p className="text-lg font-medium">No live trades yet</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Create the first live trade to get started
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-border">
										<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
											Symbol
										</th>
										<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
											Category
										</th>
										<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
											Expected ROI
										</th>
										<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
											Status
										</th>
										<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
											Opened
										</th>
										<th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{trades.map((trade) => (
										<tr key={trade._id} className="border-b border-border hover:bg-accent/5">
											<td className="px-4 py-4">
												<span className="font-mono font-semibold">{trade.symbol}</span>
											</td>
											<td className="px-4 py-4 text-sm">{trade.category}</td>
											<td className="px-4 py-4">
												<span className="text-sm font-medium text-green-600">
													+{trade.expectedProfit.toFixed(2)}%
												</span>
											</td>
											<td className="px-4 py-4">
												{trade.status === "open" ? (
													<Badge variant="warning">Open</Badge>
												) : (
													<Badge variant="outline">Closed</Badge>
												)}
											</td>
											<td className="px-4 py-4 text-sm text-muted-foreground">
												{new Date(trade.openedAt).toLocaleString()}
											</td>
											<td className="px-4 py-4">
												<div className="flex items-center justify-end gap-2">
													{trade.status === "open" && (
														<Button
															size="sm"
															variant="outline"
															onClick={() => void handleCloseTrade(trade._id)}
														>
															Close Trade
														</Button>
													)}
													{deleteConfirm === trade._id ? (
														<div className="flex items-center gap-2">
															<Button
																size="sm"
																variant="destructive"
																onClick={() => void handleDelete(trade._id)}
															>
																Confirm
															</Button>
															<Button
																size="sm"
																variant="ghost"
																onClick={() => setDeleteConfirm(null)}
															>
																<X className="h-4 w-4" />
															</Button>
														</div>
													) : (
														<Button
															size="sm"
															variant="ghost"
															onClick={() => setDeleteConfirm(trade._id)}
															className="text-red-600 hover:text-red-700"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
