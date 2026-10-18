import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PortfolioMetrics {
	totalValue: number;
	totalChange: number;
	totalChangePercent: number;
	dayChange: number;
	dayChangePercent: number;
	buyingPower: number;
}

export interface PortfolioSummaryProps {
	metrics: PortfolioMetrics;
	className?: string;
	isDataLoaded?: boolean;
}

export function PortfolioSummary({ metrics, className, isDataLoaded = true }: PortfolioSummaryProps) {
	const isPositive = metrics.totalChangePercent >= 0;
	const isDayPositive = metrics.dayChangePercent >= 0;

	// Show 0 until data is properly loaded to prevent displaying unrealistic values
	const displayMetrics = isDataLoaded ? metrics : {
		totalValue: 0,
		totalChange: 0,
		totalChangePercent: 0,
		dayChange: 0,
		dayChangePercent: 0,
		buyingPower: 0,
	};

	return (
		<div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
			{/* Total Portfolio Value */}
			<Card variant="elevated" padding="sm" className="relative overflow-hidden">
				<div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl" />
				<div className="relative space-y-5">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<DollarSign className="h-4 w-4" />
						<span>Total Portfolio Value</span>
					</div>
					<div className="space-y-4">
						<p className="text-3xl font-bold tracking-tight">
							$
							{displayMetrics.totalValue.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</p>
						<div className="flex items-center gap-2">
							<Badge variant={isPositive ? "default" : "destructive"} className="gap-1">
								{isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
								<span>
									{isPositive ? "+" : ""}$
									{Math.abs(displayMetrics.totalChange).toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</span>
							</Badge>
							<span className={cn("text-sm font-medium", isPositive ? "text-green-600" : "text-red-600")}>
								{isPositive ? "+" : ""}
								{displayMetrics.totalChangePercent.toFixed(2)}%
							</span>
						</div>
					</div>
				</div>
			</Card>

			{/* Today's Change */}
			<Card variant="elevated" padding="sm" className="relative overflow-hidden">
				<div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 rounded-full blur-3xl" />
				<div className="relative space-y-5">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Activity className="h-4 w-4" />
						<span>Today's Change</span>
					</div>
					<div className="space-y-4">
						<p
							className={cn(
								"text-3xl font-bold tracking-tight",
								isDayPositive ? "text-green-600" : "text-red-600",
							)}
						>
							{isDayPositive ? "+" : ""}$
							{Math.abs(displayMetrics.dayChange).toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</p>
						<div className="flex items-center gap-2">
							<Badge variant={isDayPositive ? "default" : "destructive"} className="gap-1">
								{isDayPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
								<span>
									{isDayPositive ? "+" : ""}
									{displayMetrics.dayChangePercent.toFixed(2)}%
								</span>
							</Badge>
							<span className="text-sm text-muted-foreground">vs yesterday close</span>
						</div>
					</div>
				</div>
			</Card>

			{/* Buying Power */}
			<Card variant="elevated" padding="sm" className="relative overflow-hidden">
				<div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl" />
				<div className="relative space-y-5">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<PieChart className="h-4 w-4" />
						<span>Buying Power</span>
					</div>
					<div className="space-y-4">
						<p className="text-3xl font-bold tracking-tight">
							$
							{displayMetrics.buyingPower.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</p>
						<p className="text-sm text-muted-foreground">Available to invest</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
