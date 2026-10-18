import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export interface Asset {
	symbol: string;
	name: string;
	quantity: number;
	currentPrice: number;
	totalValue: number;
	changePercent: number;
	chartData: { value: number }[];
}

export interface AssetListProps {
	assets: Asset[];
	onViewAll?: () => void;
	className?: string;
}

export function AssetList({ assets, onViewAll, className }: AssetListProps) {
	return (
		<Card variant="elevated" padding="none" className={className}>
			{/* Header */}
			<div className="flex items-center justify-between p-6 border-b border-border">
				<div>
					<h3 className="text-lg font-semibold">Your Assets</h3>
					<p className="text-sm text-muted-foreground">
						{assets.length} holdings
					</p>
				</div>
				{onViewAll && (
					<Button variant="ghost" size="sm" onClick={onViewAll} className="gap-2">
						<span>View All</span>
						<ArrowRight className="h-4 w-4" />
					</Button>
				)}
			</div>

			{/* Asset List */}
			<div className="divide-y divide-border">
				{assets.map((asset) => {
					const isPositive = asset.changePercent >= 0;

					return (
						<div
							key={asset.symbol}
							className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
						>
							<div className="flex items-center justify-between gap-4">
								{/* Asset Info */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<span className="font-semibold">{asset.symbol}</span>
										<Badge
											variant={isPositive ? "default" : "destructive"}
											className="gap-1"
										>
											{isPositive ? (
												<TrendingUp className="h-3 w-3" />
											) : (
												<TrendingDown className="h-3 w-3" />
											)}
											<span>{isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%</span>
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground truncate">
										{asset.quantity.toLocaleString()} {asset.quantity === 1 ? 'share' : 'shares'} • {asset.name}
									</p>
								</div>

								{/* Sparkline */}
								<div className="hidden sm:block w-20 h-12">
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart data={asset.chartData}>
											<defs>
												<linearGradient id={`gradient-${asset.symbol}`} x1="0" y1="0" x2="0" y2="1">
													<stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
													<stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
												</linearGradient>
											</defs>
											<Area
												type="monotone"
												dataKey="value"
												stroke={isPositive ? "#10b981" : "#ef4444"}
												strokeWidth={1.5}
												fill={`url(#gradient-${asset.symbol})`}
												dot={false}
											/>
										</AreaChart>
									</ResponsiveContainer>
								</div>

								{/* Values */}
								<div className="text-right">
									<p className="font-semibold">
										${asset.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
									</p>
									<p className="text-sm text-muted-foreground">
										${asset.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/share
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Empty State */}
			{assets.length === 0 && (
				<div className="p-12 text-center">
					<p className="text-muted-foreground mb-4">No assets yet</p>
					<Button variant="primary" size="sm">
						Start investing
					</Button>
				</div>
			)}
		</Card>
	);
}
