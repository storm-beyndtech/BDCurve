import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickActionsProps {
	onDeposit?: () => void;
	onWithdraw?: () => void;
	onTrade?: () => void;
	className?: string;
}

const actions = [
	{
		id: "deposit",
		label: "Deposit",
		description: "Add funds to your account",
		icon: ArrowDownLeft,
		color: "primary",
		key: "onDeposit" as const,
	},
	{
		id: "withdraw",
		label: "Withdraw",
		description: "Transfer funds out",
		icon: ArrowUpRight,
		color: "accent",
		key: "onWithdraw" as const,
	},
	{
		id: "trade",
		label: "Trade",
		description: "Buy or sell assets",
		icon: TrendingUp,
		color: "primary",
		key: "onTrade" as const,
	},
];

export function QuickActions({ onDeposit, onWithdraw, onTrade, className }: QuickActionsProps) {
	const handlers = {
		onDeposit,
		onWithdraw,
		onTrade,
	};

	return (
		<Card variant="elevated" padding="lg" className={className}>
			<div className="space-y-4">
				<div>
					<h3 className="text-lg font-semibold mb-1">Quick Actions</h3>
					<p className="text-sm text-muted-foreground">
						Manage your account in seconds
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					{actions.map((action) => {
						const Icon = action.icon;
						const handler = handlers[action.key];

						return (
							<Button
								key={action.id}
								variant="outline"
								size="lg"
								onClick={handler}
								className={cn(
									"flex-col h-auto py-6 gap-3 hover:shadow-depth transition-all group",
									!handler && "opacity-50 cursor-not-allowed"
								)}
								disabled={!handler}
							>
								<div className={cn(
									"w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
									action.color === "primary"
										? "bg-primary-500/10 text-primary-600 group-hover:bg-primary-500/20"
										: "bg-accent-500/10 text-accent-600 group-hover:bg-accent-500/20"
								)}>
									<Icon className="h-6 w-6" />
								</div>
								<div className="text-center">
									<p className="font-semibold mb-1">{action.label}</p>
									<p className="text-xs text-muted-foreground">
										{action.description}
									</p>
								</div>
							</Button>
						);
					})}
				</div>
			</div>
		</Card>
	);
}
