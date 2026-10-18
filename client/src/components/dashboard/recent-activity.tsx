import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityItem {
	id: string;
	type: "buy" | "sell" | "deposit" | "withdrawal" | "profit";
	symbol?: string;
	quantity?: number;
	price?: number;
	amount: number;
	timestamp: Date;
	status: "completed" | "pending" | "failed";
}

export interface RecentActivityProps {
	activities: ActivityItem[];
	onViewAll?: () => void;
	className?: string;
}

const activityConfig = {
	buy: {
		label: "Buy",
		icon: ArrowDownLeft,
		color: "text-green-600",
		bgColor: "bg-green-500/10",
	},
	sell: {
		label: "Sell",
		icon: ArrowUpRight,
		color: "text-red-600",
		bgColor: "bg-red-500/10",
	},
	deposit: {
		label: "Deposit",
		icon: ArrowDownLeft,
		color: "text-blue-600",
		bgColor: "bg-blue-500/10",
	},
	withdrawal: {
		label: "Withdrawal",
		icon: ArrowUpRight,
		color: "text-orange-600",
		bgColor: "bg-orange-500/10",
	},
	profit: {
		label: "Profit",
		icon: TrendingUp,
		color: "text-emerald-600",
		bgColor: "bg-emerald-500/10",
	},
};

export function RecentActivity({ activities, onViewAll, className }: RecentActivityProps) {
	const formatTimestamp = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return "Just now";
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		return `${days}d ago`;
	};

	return (
		<Card variant="elevated" padding="none" className={className}>
			{/* Header */}
			<div className="flex items-center justify-between p-6 border-b border-border">
				<div>
					<h3 className="text-lg font-semibold">Recent Activity</h3>
					<p className="text-sm text-muted-foreground">
						Last {activities.length} transactions
					</p>
				</div>
				{onViewAll && (
					<Button variant="ghost" size="sm" onClick={onViewAll} className="gap-2">
						<span>View All</span>
						<ArrowRight className="h-4 w-4" />
					</Button>
				)}
			</div>

			{/* Activity List */}
			<div className="divide-y divide-border">
				{activities.map((activity) => {
					const config = activityConfig[activity.type] || {
						label: "Transaction",
						icon: ArrowRight,
						color: "text-gray-600",
						bgColor: "bg-gray-500/10",
					};
					const Icon = config.icon;
					const isCredit =
						activity.type === "buy" ||
						activity.type === "deposit" ||
						(activity.type === "profit" && activity.amount >= 0);

					return (
						<div
							key={activity.id}
							className="p-4 hover:bg-muted/50 transition-colors"
						>
							<div className="flex items-center gap-4">
								{/* Icon */}
								<div className={cn(
									"w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
									config.bgColor
								)}>
									<Icon className={cn("h-5 w-5", config.color)} />
								</div>

								{/* Details */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<span className="font-medium">{config.label}</span>
										{activity.symbol && (
											<span className="text-sm font-semibold">{activity.symbol}</span>
										)}
										{activity.status !== "completed" && (
											<Badge
												variant={activity.status === "pending" ? "default" : "destructive"}
												className="text-xs"
											>
												{activity.status}
											</Badge>
										)}
									</div>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										{activity.quantity && activity.price && (
											<span>
												{activity.quantity} {activity.quantity === 1 ? 'share' : 'shares'} @ ${activity.price.toFixed(2)}
											</span>
										)}
										<span>•</span>
										<div className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											<span>{formatTimestamp(activity.timestamp)}</span>
										</div>
									</div>
								</div>

								{/* Amount */}
								<div className="text-right">
									<p className={cn(
										"font-semibold",
										isCredit
											? "text-green-600"
											: "text-red-600"
									)}>
										{isCredit ? '+' : '-'}
										${Math.abs(activity.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Empty State */}
			{activities.length === 0 && (
				<div className="p-12 text-center">
					<p className="text-muted-foreground">No recent activity</p>
				</div>
			)}
		</Card>
	);
}
