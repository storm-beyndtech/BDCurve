import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export interface TrendingAsset {
	symbol: string;
	name: string;
	price: number;
	changePercent: number;
	volume: string;
	chartData: { value: number }[];
	category: "stocks" | "crypto" | "etf";
}

export interface TrendingAssetsProps {
	assets: TrendingAsset[];
	className?: string;
}

const categoryColors = {
	stocks: "text-blue-600 bg-blue-500/10",
	crypto: "text-purple-600 bg-purple-500/10",
	etf: "text-emerald-600 bg-emerald-500/10",
};

const categoryLabels = {
	stocks: "Stock",
	crypto: "Crypto",
	etf: "ETF",
};

export function TrendingAssets({ assets, className }: TrendingAssetsProps) {
	return (
		<Card variant="elevated" padding="lg" className={className}>
			<div className="space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
							<Flame className="h-5 w-5 text-orange-600" />
						</div>
						<div>
							<h3 className="text-lg font-semibold">Trending Now</h3>
							<p className="text-sm text-muted-foreground">
								Top movers across all markets
							</p>
						</div>
					</div>
				</div>

				{/* Assets List */}
				<div className="space-y-3">
					{assets.map((asset, index) => {
						const isPositive = asset.changePercent >= 0;

						return (
							<div
								key={asset.symbol}
								className="flex items-center gap-4 p-4 rounded-lg bg-card/40 border border-border hover:bg-card/60 transition-colors cursor-pointer group"
							>
								{/* Rank */}
								<div className="flex-shrink-0 w-6 text-center">
									<span className="text-sm font-bold text-muted-foreground">
										{index + 1}
									</span>
								</div>

								{/* Asset Info */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<span className="font-semibold">{asset.symbol}</span>
										<Badge className={cn("text-xs", categoryColors[asset.category])}>
											{categoryLabels[asset.category]}
										</Badge>
									</div>
									<p className="text-xs text-muted-foreground truncate">
										{asset.name} • Vol: {asset.volume}
									</p>
								</div>

								{/* Sparkline */}
								<div className="hidden md:block w-24 h-12 flex-shrink-0">
									<ResponsiveContainer width="100%" height="100%">
										<LineChart data={asset.chartData}>
											<Line
												type="monotone"
												dataKey="value"
												stroke={isPositive ? "#10b981" : "#ef4444"}
												strokeWidth={2}
												dot={false}
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>

								{/* Price & Change */}
								<div className="text-right flex-shrink-0">
									<p className="font-semibold text-sm">
										${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
									</p>
									<div className={cn(
										"flex items-center justify-end gap-1 text-xs font-medium",
										isPositive ? "text-green-600" : "text-red-600"
									)}>
										{isPositive ? (
											<TrendingUp className="h-3 w-3" />
										) : (
											<TrendingDown className="h-3 w-3" />
										)}
										<span>{isPositive ? "+" : ""}{asset.changePercent.toFixed(2)}%</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</Card>
	);
}
