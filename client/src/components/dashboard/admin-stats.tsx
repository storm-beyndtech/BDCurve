import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminStat {
	label: string;
	value: string;
	change: number;
	changeLabel: string;
	icon: React.ElementType;
	color: "primary" | "accent" | "success" | "warning";
}

export interface AdminStatsProps {
	stats: AdminStat[];
	className?: string;
}

const colorConfig = {
	primary: {
		bg: "bg-primary-500/10",
		text: "text-primary-600",
		badge: "bg-primary-500/20 text-primary-700",
	},
	accent: {
		bg: "bg-accent-500/10",
		text: "text-accent-600",
		badge: "bg-accent-500/20 text-accent-700",
	},
	success: {
		bg: "bg-green-500/10",
		text: "text-green-600",
		badge: "bg-green-500/20 text-green-700",
	},
	warning: {
		bg: "bg-orange-500/10",
		text: "text-orange-600",
		badge: "bg-orange-500/20 text-orange-700",
	},
};

export function AdminStats({ stats, className }: AdminStatsProps) {
	return (
		<div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
			{stats.map((stat, index) => {
				const Icon = stat.icon;
				const colors = colorConfig[stat.color];
				const isPositive = stat.change >= 0;

				return (
					<Card key={index} variant="elevated" padding="lg" className="relative overflow-hidden">
						<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-current opacity-5 rounded-full blur-3xl" />
						<div className="relative space-y-3">
							<div className="flex items-center justify-between">
								<div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors.bg)}>
									<Icon className={cn("h-6 w-6", colors.text)} />
								</div>
								<Badge
									variant={isPositive ? "default" : "destructive"}
									className="text-xs"
								>
									{isPositive ? "+" : ""}{stat.change}%
								</Badge>
							</div>
							<div>
								<p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
								<p className="text-2xl font-bold tracking-tight">{stat.value}</p>
								<p className="text-xs text-muted-foreground mt-1">{stat.changeLabel}</p>
							</div>
						</div>
					</Card>
				);
			})}
		</div>
	);
}
