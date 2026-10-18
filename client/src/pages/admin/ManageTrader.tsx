import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TraderForm from "@/components/TraderForm";
import { Plus, Edit, Trash2, Users, TrendingUp, X } from "lucide-react";
import { toast } from "sonner";

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

export default function ManageTrader() {
	const [traders, setTraders] = useState<Trader[]>([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

	const API_URL = import.meta.env.VITE_API_URL;

	useEffect(() => {
		fetchTraders();
	}, []);

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

	const handleCreateOrUpdate = async (formData: FormData) => {
		setActionLoading(true);
		try {
			const token = localStorage.getItem("token");
			const url = selectedTrader
				? `${API_URL}/api/trader/${selectedTrader._id}`
				: `${API_URL}/api/trader/create`;

			const response = await fetch(url, {
				method: selectedTrader ? "PUT" : "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			const data = await response.json();

			if (response.ok) {
				toast.success(data.message || `Trader ${selectedTrader ? "updated" : "created"} successfully`);
				setShowForm(false);
				setSelectedTrader(null);
				fetchTraders();
			} else {
				toast.error(data.message || `Failed to ${selectedTrader ? "update" : "create"} trader`);
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("Failed to process request");
		} finally {
			setActionLoading(false);
		}
	};

	const handleEdit = (trader: Trader) => {
		setSelectedTrader(trader);
		setShowForm(true);
	};

	const handleDelete = async (traderId: string) => {
		setActionLoading(true);
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`${API_URL}/api/trader/${traderId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (response.ok) {
				toast.success(data.message || "Trader deleted successfully");
				setDeleteConfirm(null);
				fetchTraders();
			} else {
				toast.error(data.message || "Failed to delete trader");
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("Failed to delete trader");
		} finally {
			setActionLoading(false);
		}
	};

	const handleCancel = () => {
		setShowForm(false);
		setSelectedTrader(null);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "active":
				return <Badge variant="success">Active</Badge>;
			case "paused":
				return <Badge variant="warning">Paused</Badge>;
			case "terminated":
				return <Badge variant="destructive">Terminated</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const getRiskBadge = (risk: string) => {
		switch (risk) {
			case "Low":
				return <Badge variant="success">Low</Badge>;
			case "Medium":
				return <Badge variant="warning">Medium</Badge>;
			case "High":
				return <Badge variant="destructive">High</Badge>;
			default:
				return <Badge variant="outline">{risk}</Badge>;
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading traders...</p>
				</div>
			</div>
		);
	}

	if (showForm) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-semibold tracking-tight">
							{selectedTrader ? "Edit Trader" : "Create New Trader"}
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							{selectedTrader ? "Update trader information" : "Add a new professional trader"}
						</p>
					</div>
				</div>

				<TraderForm
					trader={selectedTrader}
					onSubmit={handleCreateOrUpdate}
					onCancel={handleCancel}
					loading={actionLoading}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">Manage Traders</h1>
					<p className="text-sm text-muted-foreground mt-1">Create and manage professional traders</p>
				</div>
				<Button variant="primary-purple" onClick={() => setShowForm(true)} className="gap-2">
					<Plus className="h-4 w-4" />
					Add New Trader
				</Button>
			</div>

			{/* Traders List */}
			<Card variant="glass" padding="lg">
				<CardHeader className="p-0 mb-6">
					<CardTitle className="text-lg">All Traders ({traders.length})</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{traders.length === 0 ? (
						<div className="text-center py-12">
							<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-lg font-medium">No traders yet</p>
							<p className="text-sm text-muted-foreground mt-1">Create your first trader to get started</p>
							<Button variant="outline" onClick={() => setShowForm(true)} className="mt-4 gap-2">
								<Plus className="h-4 w-4" />
								Create Trader
							</Button>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-border">
										<th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Trader</th>
										<th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Specialization</th>
										<th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Performance</th>
										<th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Risk</th>
										<th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Copiers</th>
										<th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
										<th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
									</tr>
								</thead>
								<tbody>
									{traders.map((trader) => (
										<tr key={trader._id} className="border-b border-border hover:bg-accent/5">
											<td className="py-4 px-4">
												<div className="flex items-center gap-3">
													<img
														src={trader.profileImage}
														alt={trader.name}
														className="w-10 h-10 rounded-full object-cover"
														onError={(e) => {
															(e.target as HTMLImageElement).src =
																"https://res.cloudinary.com/demo/image/upload/avatar-placeholder.png";
														}}
													/>
													<div>
														<p className="font-medium text-sm">{trader.name}</p>
														<p className="text-xs text-muted-foreground">@{trader.username}</p>
													</div>
												</div>
											</td>
											<td className="py-4 px-4">
												<span className="text-sm">{trader.specialization}</span>
											</td>
											<td className="py-4 px-4">
												<span className="text-sm font-medium text-green-600">
													{trader.profitPercentage.monthly}%
												</span>
												<span className="text-xs text-muted-foreground"> monthly</span>
												<p className="text-xs text-muted-foreground mt-0.5">
													{trader.winRate}% win rate
												</p>
											</td>
											<td className="py-4 px-4">
												<span className="text-sm">{trader.riskLevel}</span>
											</td>
											<td className="py-4 px-4">
												<span className="text-sm">{trader.totalCopiers}</span>
											</td>
											<td className="py-4 px-4">{getStatusBadge(trader.status)}</td>
											<td className="py-4 px-4">
												<div className="flex items-center justify-end gap-2">
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleEdit(trader)}
														className="gap-2"
													>
														<Edit className="h-4 w-4" />
														Edit
													</Button>
													{deleteConfirm === trader._id ? (
														<div className="flex items-center gap-2">
															<Button
																size="sm"
																variant="destructive"
																onClick={() => handleDelete(trader._id)}
																disabled={actionLoading}
															>
																{actionLoading ? "Deleting..." : "Confirm"}
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
															onClick={() => setDeleteConfirm(trader._id)}
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
