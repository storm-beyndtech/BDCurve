import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetLogo } from "@/components/common/asset-logo";

export interface MarketIndex {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
}

export interface MarketOverviewProps {
	indices: MarketIndex[];
	cryptos: MarketIndex[];
	className?: string;
}

export function MarketOverview({ indices, cryptos, className }: MarketOverviewProps) {
	const renderMarketItem = (item: MarketIndex, type: "stock" | "crypto") => {
		const isPositive = item.changePercent >= 0;

		return (
			<div
				key={item.symbol}
				className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg bg-card/40 border border-border hover:bg-card/60 transition-colors"
			>
				<AssetLogo symbol={item.symbol} name={item.name} type={type} size={36} />
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2 mb-1">
						<span className="font-semibold text-sm">{item.symbol}</span>
						{isPositive ? (
							<TrendingUp className="h-3 w-3 text-green-600" />
						) : (
							<TrendingDown className="h-3 w-3 text-red-600" />
						)}
					</div>
					<p className="text-xs text-muted-foreground">{item.name}</p>
				</div>
				<div className="text-right">
					<p className="font-semibold text-sm">
						${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
					</p>
					<p className={cn(
						"text-xs font-medium",
						isPositive ? "text-green-600" : "text-red-600"
					)}>
						{isPositive ? "+" : ""}{item.changePercent.toFixed(2)}%
					</p>
				</div>
			</div>
		);
	};

	return (
		<Card variant="elevated" padding="lg" className={className}>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold mb-1">Market Overview</h3>
						<p className="text-sm text-muted-foreground">
							Live market indices and crypto prices
						</p>
					</div>
					<Badge variant="default" className="gap-1">
						<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
						<span>Live</span>
					</Badge>
				</div>

				{/* Market Indices */}
				<div>
					<h4 className="text-sm font-medium text-muted-foreground mb-3">Major Indices</h4>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
						{indices.map((item) => renderMarketItem(item, "stock"))}
					</div>
				</div>

				{/* Crypto Prices */}
				<div>
					<h4 className="text-sm font-medium text-muted-foreground mb-3">Top Cryptocurrencies</h4>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
						{cryptos.map((item) => renderMarketItem(item, "crypto"))}
					</div>
				</div>
			</div>
		</Card>
	);
}
