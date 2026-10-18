import React from "react";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export interface UserGrowthData {
	month: string;
	users: number;
	activeUsers: number;
}

export interface UserGrowthChartProps {
	data: UserGrowthData[];
	className?: string;
}

export function UserGrowthChart({ data, className }: UserGrowthChartProps) {
	return (
		<Card variant="elevated" padding="lg" className={className}>
			<div className="space-y-4">
				<div>
					<h3 className="text-lg font-semibold mb-1">User Growth</h3>
					<p className="text-sm text-muted-foreground">
						Total and active user trends over the past 6 months
					</p>
				</div>

				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
							<defs>
								<linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
									<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
								</linearGradient>
								<linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
									<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
							<XAxis
								dataKey="month"
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
								tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "hsl(var(--card))",
									border: "1px solid hsl(var(--border))",
									borderRadius: "8px",
									padding: "12px",
								}}
								formatter={(value: number, name: string) => {
									if (name === "users") {
										return [value.toLocaleString(), "Total Users"];
									}
									return [value.toLocaleString(), "Active Users"];
								}}
								labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
							/>
							<Area
								type="monotone"
								dataKey="users"
								stroke="#3b82f6"
								strokeWidth={2}
								fillOpacity={1}
								fill="url(#colorUsers)"
							/>
							<Area
								type="monotone"
								dataKey="activeUsers"
								stroke="#10b981"
								strokeWidth={2}
								fillOpacity={1}
								fill="url(#colorActiveUsers)"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>
		</Card>
	);
}
