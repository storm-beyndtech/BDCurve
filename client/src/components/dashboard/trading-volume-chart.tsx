import React from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";

export interface VolumeData {
	date: string;
	volume: number;
	trades: number;
}

export interface TradingVolumeChartProps {
	data: VolumeData[];
	className?: string;
}

export function TradingVolumeChart({ data, className }: TradingVolumeChartProps) {
	return (
		<Card variant="elevated" padding="lg" className={className}>
			<div className="space-y-4">
				<div>
					<h3 className="text-lg font-semibold mb-1">Trading Volume</h3>
					<p className="text-sm text-muted-foreground">
						Daily trading volume over the past 7 days
					</p>
				</div>

				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
							<XAxis
								dataKey="date"
								stroke="hsl(var(--muted-foreground))"
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								stroke="hsl(var(--muted-foreground))"
								fontSize={12}
								tickLine={false}
								axisLine={false}
								tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "hsl(var(--card))",
									border: "1px solid hsl(var(--border))",
									borderRadius: "8px",
									padding: "12px",
								}}
								formatter={(value: number, name: string) => {
									if (name === "volume") {
										return [`$${value.toLocaleString()}`, "Volume"];
									}
									return [value.toLocaleString(), "Trades"];
								}}
								labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
							/>
							<Legend
								wrapperStyle={{ paddingTop: "20px" }}
								iconType="circle"
								formatter={(value) => {
									if (value === "volume") return "Trading Volume";
									return "Number of Trades";
								}}
							/>
							<Bar dataKey="volume" fill="#3b82f6" radius={[8, 8, 0, 0]} />
							<Bar dataKey="trades" fill="#10b981" radius={[8, 8, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</Card>
	);
}
