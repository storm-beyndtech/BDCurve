import { useMemo } from "react";
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
import { formatPrice, toMs } from "@/lib/chart-utils";

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
 * Shared AreaChart. Computes an explicit padded Y domain so small relative moves (or sub-cent prices)
 * are not rendered as a flat line, and shows an "unavailable" state instead of a fake zero line.
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
	const gradientId = `price-gradient-${symbol.replace(/[^a-zA-Z0-9]/g, "")}-${variant}`;
	const isCompact = variant === "compact";

	const { points, domain, spanMs } = useMemo(() => {
		const clean = (data || [])
			.filter((d) => Number.isFinite(d?.value) && (d.value as number) > 0)
			.map((d) => ({ ...d, time: typeof d.time === "number" ? toMs(d.time) : d.time }));
		if (!clean.length) return { points: [], domain: [0, 1] as [number, number], spanMs: 0 };
		const values = clean.map((d) => d.value);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const pad = max > min ? (max - min) * 0.08 : Math.abs(max) * 0.005 || 1;
		const times = clean.map((d) => d.time).filter((t): t is number => typeof t === "number");
		const span = times.length > 1 ? times[times.length - 1] - times[0] : 0;
		return { points: clean, domain: [Math.max(0, min - pad), max + pad] as [number, number], spanMs: span };
	}, [data]);

	const formatTick = (value: unknown) => {
		if (typeof value !== "number" || value < 1e11) return String(value ?? "");
		const date = new Date(value);
		if (spanMs <= 2 * 86_400_000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
		if (spanMs <= 120 * 86_400_000) return date.toLocaleDateString([], { month: "short", day: "numeric" });
		return date.toLocaleDateString([], { month: "short", year: "2-digit" });
	};

	if (!points.length) {
		return (
			<div className={cn("flex items-center justify-center text-xs text-muted-foreground", className)} style={{ height }}>
				{isCompact ? "—" : "Chart data unavailable right now"}
			</div>
		);
	}

	return (
		<div className={cn(className)} style={{ height }}>
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={points}
					margin={isCompact ? { top: 6, right: 6, left: 6, bottom: 0 } : { top: 12, right: 18, left: 0, bottom: 0 }}
				>
					<defs>
						<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={chartColor} stopOpacity={0.35} />
							<stop offset="95%" stopColor={chartColor} stopOpacity={0} />
						</linearGradient>
					</defs>
					{!isCompact && showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />}
					<YAxis hide={isCompact} domain={domain} stroke="#888" fontSize={12} width={72} tickFormatter={(v: number) => formatPrice(v)} />
					{!isCompact && (
						<>
							<XAxis dataKey="time" stroke="#888" fontSize={12} tickMargin={8} minTickGap={40} tickFormatter={formatTick} />
							<Tooltip
								contentStyle={{
									backgroundColor: "rgba(0, 0, 0, 0.9)",
									border: "1px solid rgba(255, 255, 255, 0.1)",
									borderRadius: "8px",
									color: "#fff",
								}}
								labelFormatter={(label: unknown) => (typeof label === "number" && label > 1e11 ? new Date(label).toLocaleString() : String(label ?? ""))}
								formatter={(value: unknown) => [`$${formatPrice(Number(value))}`, "Price"]}
							/>
						</>
					)}
					<Area
						type="monotone"
						dataKey="value"
						stroke={chartColor}
						strokeWidth={isCompact ? 2 : 2.5}
						fill={`url(#${gradientId})`}
						dot={false}
						isAnimationActive={false}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
