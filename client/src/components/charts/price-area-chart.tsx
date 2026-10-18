import React from "react";
import {
	AreaChart,
	Area,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

export interface PricePoint {
	value: number;
	time?: string | number;
	label?: string;
}

interface PriceAreaChartProps {
	symbol: string;
	data: PricePoint[];
	isPositive: boolean;
	variant?: "full" | "compact";
	className?: string;
	height?: number | string;
	showGrid?: boolean;
}

/**
 * Shared AreaChart with the same gradient/fill treatment used on the Stock Details page.
 * The "compact" variant hides axes/tooltips for list rows while keeping identical styling.
 */
export function PriceAreaChart({
	symbol,
	data,
	isPositive,
	variant = "full",
	className,
	height = "100%",
	showGrid = true,
}: PriceAreaChartProps) {
	const chartColor = isPositive ? "#10b981" : "#ef4444";
	const gradientId = `price-gradient-${symbol}-${variant}`;
	const isCompact = variant === "compact";
	const normalizedData = (() => {
		if (!data || data.length === 0) return [{ value: 0 }, { value: 0.1 }];
		const min = Math.min(...data.map((d) => d.value ?? 0));
		const max = Math.max(...data.map((d) => d.value ?? 0));
		if (max > min) return data;
		// Flat line: add a tiny wobble to avoid invisible rendering
		const bump = min === 0 ? 0.5 : Math.abs(min) * 0.01 || 0.5;
		return data.map((d, i) => ({
			...d,
			value: (d.value ?? 0) + (i % 2 === 0 ? -bump : bump),
		}));
	})();

	return (
		<div className={cn(className)} style={{ height }}>
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={normalizedData}
					margin={
						isCompact
							? { top: 6, right: 6, left: 6, bottom: 0 }
							: { top: 12, right: 18, left: 0, bottom: 0 }
					}
				>
					<defs>
						<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
							<stop offset="95%" stopColor={chartColor} stopOpacity={0} />
						</linearGradient>
					</defs>
					{!isCompact && showGrid && (
						<CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
					)}
					{!isCompact && (
						<>
							<XAxis dataKey="time" stroke="#888" fontSize={12} tickMargin={8} />
							<YAxis stroke="#888" fontSize={12} domain={["auto", "auto"]} />
							<Tooltip
								contentStyle={{
									backgroundColor: "rgba(0, 0, 0, 0.9)",
									border: "1px solid rgba(255, 255, 255, 0.1)",
									borderRadius: "8px",
									color: "#fff",
								}}
								formatter={(value: any) => [`$${(value as number).toLocaleString()}`, "Price"]}
							/>
						</>
					)}
					<Area
						type="monotone"
						dataKey="value"
						stroke={chartColor}
						strokeWidth={isCompact ? 2 : 3}
						fill={`url(#${gradientId})`}
						dot={false}
						isAnimationActive={!isCompact}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
