import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PendingAction {
	id: string;
	type: "kyc" | "withdrawal" | "support" | "verification";
	title: string;
	description: string;
	priority: "high" | "medium" | "low";
	timestamp: Date;
	user?: string;
}

export interface PendingActionsProps {
	actions: PendingAction[];
	onViewAll?: () => void;
	className?: string;
}

const typeConfig = {
	kyc: {
		label: "KYC Review",
		icon: CheckCircle,
		color: "text-blue-600",
		bgColor: "bg-blue-500/10",
	},
	withdrawal: {
		label: "Withdrawal",
		icon: AlertCircle,
		color: "text-orange-600",
		bgColor: "bg-orange-500/10",
	},
	support: {
		label: "Support",
		icon: Clock,
		color: "text-purple-600",
		bgColor: "bg-purple-500/10",
	},
	verification: {
		label: "Verification",
		icon: CheckCircle,
		color: "text-green-600",
		bgColor: "bg-green-500/10",
	},
};

const priorityVariant = {
	high: "destructive" as const,
	medium: "default" as const,
	low: "secondary" as const,
};

export function PendingActions({ actions, onViewAll, className }: PendingActionsProps) {
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
					<h3 className="text-lg font-semibold">Pending Actions</h3>
					<p className="text-sm text-muted-foreground">
						{actions.length} items require attention
					</p>
				</div>
				{onViewAll && (
					<Button variant="ghost" size="sm" onClick={onViewAll} className="gap-2">
						<span>View All</span>
						<ArrowRight className="h-4 w-4" />
					</Button>
				)}
			</div>

			{/* Actions List */}
			<div className="divide-y divide-border">
				{actions.map((action) => {
					const config = typeConfig[action.type];
					const Icon = config.icon;

					return (
						<div
							key={action.id}
							className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
						>
							<div className="flex items-start gap-4">
								{/* Icon */}
								<div className={cn(
									"w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
									config.bgColor
								)}>
									<Icon className={cn("h-5 w-5", config.color)} />
								</div>

								{/* Details */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<span className="font-medium">{action.title}</span>
										<Badge variant={priorityVariant[action.priority]} className="text-xs">
											{action.priority}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground mb-2">
										{action.description}
									</p>
									<div className="flex items-center gap-3 text-xs text-muted-foreground">
										{action.user && (
											<>
												<span>User: {action.user}</span>
												<span>•</span>
											</>
										)}
										<div className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											<span>{formatTimestamp(action.timestamp)}</span>
										</div>
									</div>
								</div>

								{/* Action Button */}
								<Button variant="outline" size="sm" className="flex-shrink-0">
									Review
								</Button>
							</div>
						</div>
					);
				})}
			</div>

			{/* Empty State */}
			{actions.length === 0 && (
				<div className="p-12 text-center">
					<CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
					<p className="text-muted-foreground">All caught up! No pending actions.</p>
				</div>
			)}
		</Card>
	);
}
