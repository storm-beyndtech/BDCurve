import React from "react";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Activity, Globe, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MarketStat {
	label: string;
	value: string;
	subtext: string;
	icon: React.ElementType;
	color: "primary" | "accent" | "success" | "purple";
}

export interface MarketStatsProps {
	stats: MarketStat[];
	className?: string;
}

const colorConfig = {
	primary: {
		bg: "bg-primary-500/10",
		text: "text-primary-600",
		border: "border-primary-500/20",
	},
	accent: {
		bg: "bg-accent-500/10",
		text: "text-accent-600",
		border: "border-accent-500/20",
	},
	success: {
		bg: "bg-green-500/10",
		text: "text-green-600",
		border: "border-green-500/20",
	},
	purple: {
		bg: "bg-purple-500/10",
		text: "text-purple-600",
		border: "border-purple-500/20",
	},
};

export function MarketStats({ stats, className }: MarketStatsProps) {
	return (
		<div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
			{stats.map((stat, index) => {
				const Icon = stat.icon;
				const colors = colorConfig[stat.color];

				return (
					<Card
						key={index}
						variant="elevated"
						padding="lg"
						className={cn("relative overflow-hidden group hover:shadow-depth-lg transition-all")}
					>
						<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-current opacity-5 rounded-full blur-3xl" />
						<div className="relative flex items-start gap-4">
							<div className={cn(
								"w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
								colors.bg
							)}>
								<Icon className={cn("h-6 w-6", colors.text)} />
							</div>
							<div className="flex-1">
								<p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
								<p className="text-2xl font-bold tracking-tight mb-1">{stat.value}</p>
								<p className="text-xs text-muted-foreground">{stat.subtext}</p>
							</div>
						</div>
					</Card>
				);
			})}
		</div>
	);
}

// Default stats for easy implementation
export const defaultMarketStats: MarketStat[] = [
	{
		label: "24h Trading Volume",
		value: "$45.2M",
		subtext: "+12.3% from yesterday",
		icon: DollarSign,
		color: "primary",
	},
	{
		label: "Active Traders",
		value: "127,584",
		subtext: "Across all platforms",
		icon: Users,
		color: "accent",
	},
	{
		label: "Total Trades Today",
		value: "3,247",
		subtext: "Live order execution",
		icon: Activity,
		color: "success",
	},
	{
		label: "Assets Available",
		value: "9,000+",
		subtext: "Stocks, ETFs, Crypto",
		icon: TrendingUp,
		color: "purple",
	},
	{
		label: "Markets Covered",
		value: "40+",
		subtext: "Global exchanges",
		icon: Globe,
		color: "primary",
	},
	{
		label: "Avg. Execution Time",
		value: "0.3s",
		subtext: "Lightning-fast trades",
		icon: Zap,
		color: "accent",
	},
];
